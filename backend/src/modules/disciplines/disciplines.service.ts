import prisma from "../../lib/prisma";
import { AppError } from "../../lib/AppError";
import { getCategoryFromBirthDate } from "../../lib/category";
import type {
  CreateDisciplineInput,
  UpdateDisciplineInput,
  CreateGroupInput,
  UpdateGroupInput,
  AssignMemberInput,
} from "./disciplines.schema";

export async function getAllDisciplines() {
  return prisma.discipline.findMany({
    orderBy: { name: "asc" },
    include: {
      groupClasses: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { memberGroups: true } },
        },
      },
      sportsFees: {
        select: { id: true, name: true, amount: true, category: true },
      },
    },
  });
}

export async function getDisciplineById(id: number) {
  return prisma.discipline.findUnique({
    where: { id },
    include: {
      groupClasses: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { memberGroups: true } },
        },
      },
      sportsFees: {
        select: { id: true, name: true, amount: true, category: true, active: true },
      },
    },
  });
}

export async function createDiscipline(data: CreateDisciplineInput) {
  const existing = await prisma.discipline.findUnique({
    where: { name: data.name },
  });
  if (existing) {
    throw new AppError("Ya existe una disciplina con ese nombre", "DISCIPLINE_EXISTS", 400);
  }

  return prisma.discipline.create({ data: { name: data.name } });
}

export async function setupDiscipline(data: {
  name: string;
  category: string;
  schedule: string;
  days: string;
  userId: number;
  amount: number;
}) {
  const existing = await prisma.discipline.findUnique({
    where: { name: data.name },
  });
  if (existing) {
    throw new AppError("Ya existe una disciplina con ese nombre", "DISCIPLINE_EXISTS", 400);
  }

  return prisma.$transaction(async (tx) => {
    const discipline = await tx.discipline.create({
      data: { name: data.name },
    });

    const group = await tx.groupClass.create({
      data: {
        disciplineId: discipline.id,
        userId: data.userId,
        schedule: data.schedule,
        days: data.days,
      },
    });

    const fee = await tx.sportsFee.create({
      data: {
        name: `${discipline.name} ${data.category}`,
        amount: data.amount,
        category: data.category,
        disciplineId: discipline.id,
        active: true,
      },
    });

    return { discipline, group, fee };
  });
}

export async function updateDiscipline(id: number, data: UpdateDisciplineInput) {
  if (data.name) {
    const existing = await prisma.discipline.findFirst({
      where: { name: data.name, NOT: { id } },
    });
    if (existing) {
      throw new AppError("Ya existe una disciplina con ese nombre", "DISCIPLINE_EXISTS", 400);
    }
  }

  return prisma.discipline.update({
    where: { id },
    data: { name: data.name },
  });
}

export async function deleteDiscipline(id: number) {
  return prisma.discipline.delete({ where: { id } });
}

export async function getGroupsByDisciplineId(disciplineId: number) {
  return prisma.groupClass.findMany({
    where: { disciplineId },
    include: {
      user: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { memberGroups: true } },
    },
    orderBy: { schedule: "asc" },
  });
}

export async function createGroup(disciplineId: number, data: CreateGroupInput) {
  return prisma.$transaction(async (tx) => {
    const group = await tx.groupClass.create({
      data: {
        disciplineId,
        userId: data.userId,
        schedule: data.schedule,
        days: data.days,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (data.category && data.amount) {
      const discipline = await tx.discipline.findUnique({ where: { id: disciplineId } });
      await tx.sportsFee.create({
        data: {
          name: `${discipline?.name} ${data.category}`,
          amount: data.amount,
          category: data.category,
          disciplineId,
          active: true,
        },
      });
    }

    return group;
  });
}

export async function getGroupById(id: number) {
  return prisma.groupClass.findUnique({
    where: { id },
    include: {
      discipline: { include: { sportsFees: true } },
      user: { select: { id: true, firstName: true, lastName: true } },
      memberGroups: {
        include: {
          member: { select: { id: true, firstName: true, lastName: true, dni: true, birthDate: true, isActive: true } },
        },
      },
      attendances: {
        orderBy: { date: "desc" },
        take: 10,
      },
    },
  });
}

export async function updateGroup(id: number, data: UpdateGroupInput) {
  return prisma.groupClass.update({
    where: { id },
    data: {
      userId: data.userId,
      schedule: data.schedule,
      days: data.days,
    },
    include: {
      user: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

export async function deleteGroup(id: number) {
  return prisma.groupClass.delete({ where: { id } });
}

export async function assignMemberToGroup(groupId: number, data: AssignMemberInput) {
  const group = await prisma.groupClass.findUnique({
    where: { id: groupId },
    include: { discipline: { include: { sportsFees: true } } },
  });
  if (!group) {
    throw new AppError("Grupo no encontrado", "GROUP_NOT_FOUND", 404);
  }

  const member = await prisma.member.findUnique({
    where: { id: data.memberId },
  });
  if (!member) {
    throw new AppError("Socio no encontrado", "MEMBER_NOT_FOUND", 404);
  }
  if (!member.isActive) {
    throw new AppError("No se pueden inscribir socios inactivos", "MEMBER_INACTIVE", 400);
  }

  const existing = await prisma.memberGroup.findUnique({
    where: { memberId_groupClassId: { memberId: data.memberId, groupClassId: groupId } },
  });
  if (existing) {
    throw new AppError("El socio ya está asignado a este grupo", "MEMBER_ALREADY_ASSIGNED", 400);
  }

  const memberCategory = getCategoryFromBirthDate(member.birthDate);

  // Buscar arancel deportivo correspondiente
  const matchingFee = group.discipline.sportsFees.find(
    (fee) => fee.category === memberCategory && fee.active
  );

  // Crear inscripción al grupo
  const memberGroup = await prisma.memberGroup.create({
    data: {
      memberId: data.memberId,
      groupClassId: groupId,
    },
    include: {
      member: { select: { id: true, firstName: true, lastName: true, dni: true } },
    },
  });

  // Asignar arancel automáticamente si existe
  if (matchingFee) {
    const alreadyAssigned = await prisma.memberFee.findUnique({
      where: { memberId_feeId: { memberId: data.memberId, feeId: matchingFee.id } },
    });
    if (!alreadyAssigned) {
      await prisma.memberFee.create({
        data: {
          memberId: data.memberId,
          feeId: matchingFee.id,
          paid: false,
        },
      });
    }
  }

  return {
    ...memberGroup,
    autoAssignedFee: matchingFee
      ? { id: matchingFee.id, name: matchingFee.name, amount: matchingFee.amount }
      : null,
  };
}

export async function removeMemberFromGroup(groupId: number, memberId: number) {
  const existing = await prisma.memberGroup.findUnique({
    where: { memberId_groupClassId: { memberId, groupClassId: groupId } },
  });
  if (!existing) {
    throw new AppError("El socio no está asignado a este grupo", "MEMBER_NOT_ASSIGNED", 404);
  }

  return prisma.memberGroup.delete({
    where: { id: existing.id },
  });
}

export async function getTeachers() {
  return prisma.user.findMany({
    where: {
      role: {
        name: { in: ["Professor", "Administrator"] },
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
    orderBy: { lastName: "asc" },
  });
}

export async function getGroupsByTeacherId(teacherId: number) {
  return prisma.groupClass.findMany({
    where: { userId: teacherId },
    include: {
      discipline: true,
      _count: { select: { memberGroups: true } },
    },
    orderBy: { schedule: "asc" },
  });
}
