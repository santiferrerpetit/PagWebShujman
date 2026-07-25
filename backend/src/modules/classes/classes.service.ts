import prisma from "../../lib/prisma";
import { AppError } from "../../lib/AppError";
import type { CreateClassInput, UpdateClassInput } from "./classes.schema";

export async function getAllClasses(filters: { userId?: number }) {
  return prisma.groupClass.findMany({
    where: filters,
    include: {
      discipline: { select: { id: true, name: true } },
      user: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { memberGroups: true } },
    },
    orderBy: { id: "asc" },
  });
}

export async function getClassDetails(id: number) {
  const groupClass = await prisma.groupClass.findUnique({
    where: { id },
    include: {
      discipline: { select: { id: true, name: true } },
      user: { select: { id: true, firstName: true, lastName: true, username: true } },
      memberGroups: {
        include: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              dni: true,
              contact: true,
            },
          },
        },
      },
    },
  });

  if (!groupClass) {
    throw new AppError("Clase no encontrada", "CLASS_NOT_FOUND", 404);
  }

  return groupClass;
}

export async function createClass(data: CreateClassInput) {
  // Check if discipline exists
  const discipline = await prisma.discipline.findUnique({ where: { id: data.disciplineId } });
  if (!discipline) {
    throw new AppError("Disciplina no encontrada", "DISCIPLINE_NOT_FOUND", 400);
  }

  // Check if user exists
  const user = await prisma.user.findUnique({ where: { id: data.userId } });
  if (!user) {
    throw new AppError("Profesor no encontrado", "PROFESSOR_NOT_FOUND", 400);
  }

  return prisma.groupClass.create({
    data: {
      disciplineId: data.disciplineId,
      userId: data.userId,
      schedule: data.schedule,
      days: data.days,
    },
  });
}

export async function updateClass(id: number, data: UpdateClassInput) {
  const currentClass = await prisma.groupClass.findUnique({ where: { id } });
  if (!currentClass) {
    throw new AppError("Clase no encontrada", "CLASS_NOT_FOUND", 404);
  }

  // Check discipline
  const discipline = await prisma.discipline.findUnique({ where: { id: data.disciplineId } });
  if (!discipline) {
    throw new AppError("Disciplina no encontrada", "DISCIPLINE_NOT_FOUND", 400);
  }

  // Check professor
  const user = await prisma.user.findUnique({ where: { id: data.userId } });
  if (!user) {
    throw new AppError("Profesor no encontrado", "PROFESSOR_NOT_FOUND", 400);
  }

  return prisma.groupClass.update({
    where: { id },
    data: {
      disciplineId: data.disciplineId,
      userId: data.userId,
      schedule: data.schedule,
      days: data.days,
    },
  });
}

export async function deleteClass(id: number) {
  const currentClass = await prisma.groupClass.findUnique({ where: { id } });
  if (!currentClass) {
    throw new AppError("Clase no encontrada", "CLASS_NOT_FOUND", 404);
  }

  // Check if there are enrollments or attendances
  const enrollmentsCount = await prisma.memberGroup.count({ where: { groupClassId: id } });
  const attendancesCount = await prisma.attendance.count({ where: { groupClassId: id } });

  if (enrollmentsCount > 0 || attendancesCount > 0) {
    throw new AppError(
      "No se puede eliminar la clase porque tiene alumnos inscriptos o asistencias registradas. Desinscriba a los alumnos primero.",
      "CLASS_HAS_DEPENDENCIES",
      400
    );
  }

  return prisma.groupClass.delete({ where: { id } });
}

export async function enrollMember(classId: number, memberId: number) {
  // Check if class exists
  const groupClass = await prisma.groupClass.findUnique({ where: { id: classId } });
  if (!groupClass) {
    throw new AppError("Clase no encontrada", "CLASS_NOT_FOUND", 404);
  }

  // Check if member exists
  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) {
    throw new AppError("Socio no encontrado", "MEMBER_NOT_FOUND", 400);
  }

  // Check if already enrolled
  const existing = await prisma.memberGroup.findUnique({
    where: {
      memberId_groupClassId: {
        memberId,
        groupClassId: classId,
      },
    },
  });

  if (existing) {
    throw new AppError("El socio ya está inscripto en esta clase", "ALREADY_ENROLLED", 400);
  }

  return prisma.memberGroup.create({
    data: {
      memberId,
      groupClassId: classId,
    },
  });
}

export async function unenrollMember(classId: number, memberId: number) {
  const existing = await prisma.memberGroup.findUnique({
    where: {
      memberId_groupClassId: {
        memberId,
        groupClassId: classId,
      },
    },
  });

  if (!existing) {
    throw new AppError("El socio no está inscripto en esta clase", "NOT_ENROLLED", 400);
  }

  return prisma.memberGroup.delete({
    where: {
      memberId_groupClassId: {
        memberId,
        groupClassId: classId,
      },
    },
  });
}
