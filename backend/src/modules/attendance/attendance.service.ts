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

export async function getAttendanceStats() {
  const classes = await prisma.groupClass.findMany({
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
