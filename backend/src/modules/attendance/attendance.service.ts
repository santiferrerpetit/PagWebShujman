import prisma from "../../lib/prisma";
import { AppError } from "../../lib/AppError";

function normalizeDate(dateString: string): Date {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new AppError("Fecha inválida", "INVALID_DATE", 400);
  }
  // Normalize to start of day in UTC or local depending on parsing
  // Setting the UTC hours to 0 to keep dates aligned
  const normalized = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
  return normalized;
}

export async function getAttendanceList(groupClassId: number, dateString?: string) {
  const groupClass = await prisma.groupClass.findUnique({
    where: { id: groupClassId },
  });
  if (!groupClass) {
    throw new AppError("Clase no encontrada", "CLASS_NOT_FOUND", 404);
  }

  // Get enrolled members
  const enrolled = await prisma.memberGroup.findMany({
    where: { groupClassId },
    include: {
      member: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          dni: true,
        },
      },
    },
  });

  const date = dateString ? normalizeDate(dateString) : new Date();
  if (!dateString) {
    date.setUTCHours(0, 0, 0, 0);
  }

  const nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000);

  // Get attendance records for this class on this date
  const records = await prisma.attendance.findMany({
    where: {
      groupClassId,
      date: {
        gte: date,
        lt: nextDay,
      },
    },
  });

  // Map enrolled members to their attendance record
  return enrolled.map((e) => {
    const record = records.find((r) => r.memberId === e.memberId);
    return {
      memberId: e.member.id,
      firstName: e.member.firstName,
      lastName: e.member.lastName,
      dni: e.member.dni,
      present: record ? record.present : false,
      hasRecord: !!record,
    };
  });
}

export async function saveAttendance(groupClassId: number, dateString: string, records: { memberId: number; present: boolean }[]) {
  const date = normalizeDate(dateString);
  const nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000);

  // Check if class exists
  const groupClass = await prisma.groupClass.findUnique({
    where: { id: groupClassId },
  });
  if (!groupClass) {
    throw new AppError("Clase no encontrada", "CLASS_NOT_FOUND", 404);
  }

  // Perform inside transaction: delete existing and insert new
  await prisma.$transaction(async (tx) => {
    // Delete existing attendance records for this class on this date
    await tx.attendance.deleteMany({
      where: {
        groupClassId,
        date: {
          gte: date,
          lt: nextDay,
        },
      },
    });

    // Create new records
    if (records.length > 0) {
      await tx.attendance.createMany({
        data: records.map((r) => ({
          groupClassId,
          memberId: r.memberId,
          present: r.present,
          date: date,
        })),
      });
    }
  });

  return { success: true, count: records.length };
}

export async function getAttendanceStats(professorId?: number) {
  const classes = await prisma.groupClass.findMany({
    where: professorId ? { userId: professorId } : undefined,
    include: {
      discipline: { select: { name: true } },
      user: { select: { firstName: true, lastName: true } },
    },
  });

  const stats = await Promise.all(
    classes.map(async (c) => {
      const attendances = await prisma.attendance.findMany({
        where: { groupClassId: c.id },
      });

      const total = attendances.length;
      const presents = attendances.filter((a) => a.present).length;
      const rate = total > 0 ? Math.round((presents / total) * 100) : 0;

      // Get enrolled students count
      const enrolledCount = await prisma.memberGroup.count({
        where: { groupClassId: c.id },
      });

      return {
        classId: c.id,
        disciplineName: c.discipline.name,
        professorName: `${c.user.firstName} ${c.user.lastName}`,
        schedule: c.schedule,
        days: c.days,
        enrolledCount,
        totalRecords: total,
        presentsCount: presents,
        attendanceRate: rate,
      };
    })
  );

  return stats;
}

type ReportFilters = {
  from?: string;
  to?: string;
  disciplineId?: number;
  groupClassId?: number;
  professorId?: number;
};

const LOW_ATTENDANCE_THRESHOLD = 50;
const MIN_RECORDS_FOR_LOW_ATTENDANCE = 3;

function pct(presents: number, total: number) {
  return total > 0 ? Math.round((presents / total) * 100) : 0;
}

/**
 * Reporte de concurrencia: agrega la asistencia por disciplina, clase y día,
 * y detecta socios con baja asistencia. Un solo query de lectura + agregación en memoria.
 */
export async function getAttendanceReport(filters: ReportFilters) {
  const dateFilter: { gte?: Date; lt?: Date } = {};
  if (filters.from) dateFilter.gte = normalizeDate(filters.from);
  if (filters.to) dateFilter.lt = new Date(normalizeDate(filters.to).getTime() + 24 * 60 * 60 * 1000);

  const records = await prisma.attendance.findMany({
    where: {
      ...(dateFilter.gte || dateFilter.lt ? { date: dateFilter } : {}),
      ...(filters.groupClassId ? { groupClassId: filters.groupClassId } : {}),
      groupClass: {
        ...(filters.disciplineId ? { disciplineId: filters.disciplineId } : {}),
        ...(filters.professorId ? { userId: filters.professorId } : {}),
      },
    },
    include: {
      groupClass: {
        select: {
          id: true,
          days: true,
          schedule: true,
          discipline: { select: { id: true, name: true } },
        },
      },
      member: { select: { id: true, firstName: true, lastName: true, dni: true } },
    },
  });

  const byDiscipline = new Map<number, { disciplineId: number; name: string; total: number; presents: number; sessions: Set<string> }>();
  const byClass = new Map<number, { classId: number; disciplineName: string; days: string; schedule: string; total: number; presents: number; sessions: Set<string> }>();
  const byDay = new Map<string, { date: string; total: number; presents: number }>();
  const byMember = new Map<number, { memberId: number; name: string; dni: string; total: number; presents: number }>();

  for (const r of records) {
    const day = r.date.toISOString().slice(0, 10);
    const sessionKey = `${r.groupClassId}|${day}`;
    const present = r.present ? 1 : 0;
    const disc = r.groupClass.discipline;

    const d = byDiscipline.get(disc.id) ?? { disciplineId: disc.id, name: disc.name, total: 0, presents: 0, sessions: new Set<string>() };
    d.total++; d.presents += present; d.sessions.add(sessionKey);
    byDiscipline.set(disc.id, d);

    const c = byClass.get(r.groupClassId) ?? { classId: r.groupClassId, disciplineName: disc.name, days: r.groupClass.days, schedule: r.groupClass.schedule, total: 0, presents: 0, sessions: new Set<string>() };
    c.total++; c.presents += present; c.sessions.add(sessionKey);
    byClass.set(r.groupClassId, c);

    const t = byDay.get(day) ?? { date: day, total: 0, presents: 0 };
    t.total++; t.presents += present;
    byDay.set(day, t);

    const m = byMember.get(r.memberId) ?? { memberId: r.memberId, name: `${r.member.firstName} ${r.member.lastName}`, dni: r.member.dni, total: 0, presents: 0 };
    m.total++; m.presents += present;
    byMember.set(r.memberId, m);
  }

  const totalRecords = records.length;
  const totalPresents = records.reduce((n, r) => n + (r.present ? 1 : 0), 0);
  const sessions = new Set(records.map((r) => `${r.groupClassId}|${r.date.toISOString().slice(0, 10)}`));

  return {
    summary: {
      totalRecords,
      totalPresents,
      attendanceRate: pct(totalPresents, totalRecords),
      sessions: sessions.size,
      averagePerSession: sessions.size > 0 ? Math.round((totalPresents / sessions.size) * 10) / 10 : 0,
    },
    byDiscipline: [...byDiscipline.values()]
      .map(({ sessions: s, ...d }) => ({ ...d, sessions: s.size, attendanceRate: pct(d.presents, d.total), averagePerSession: s.size > 0 ? Math.round((d.presents / s.size) * 10) / 10 : 0 }))
      .sort((a, b) => b.presents - a.presents),
    byClass: [...byClass.values()]
      .map(({ sessions: s, ...c }) => ({ ...c, sessions: s.size, attendanceRate: pct(c.presents, c.total) }))
      .sort((a, b) => b.attendanceRate - a.attendanceRate),
    byDay: [...byDay.values()]
      .map((d) => ({ ...d, attendanceRate: pct(d.presents, d.total) }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    lowAttendanceMembers: [...byMember.values()]
      .filter((m) => m.total >= MIN_RECORDS_FOR_LOW_ATTENDANCE && pct(m.presents, m.total) < LOW_ATTENDANCE_THRESHOLD)
      .map((m) => ({ ...m, attendanceRate: pct(m.presents, m.total) }))
      .sort((a, b) => a.attendanceRate - b.attendanceRate)
      .slice(0, 20),
  };
}
