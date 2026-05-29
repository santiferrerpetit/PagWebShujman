import prisma from "../../lib/prisma";
import { AppError } from "../../lib/AppError";
import type { CreateMemberInput, UpdateMemberInput } from "./members.schema";

function calculateDebt(memberFees: { paid: boolean; fee: { amount: any } }[]): number {
  return memberFees
    .filter((mf) => !mf.paid)
    .reduce((sum, mf) => sum + Number(mf.fee.amount), 0);
}

export async function getAllMembers() {
  const members = await prisma.member.findMany({
    orderBy: { lastName: "asc" },
    include: {
      memberFees: {
        include: { fee: { select: { amount: true } } },
      },
    },
  });

  // Calcular deuda real como suma de aranceles pendientes
  return members.map((member) => ({
    ...member,
    accumulatedDebt: calculateDebt(member.memberFees),
  }));
}

export async function getMemberById(id: number) {
  const member = await prisma.member.findUnique({
    where: { id },
    include: {
      memberGroups: {
        include: {
          groupClass: {
            include: { discipline: true },
          },
        },
      },
      attendances: {
        orderBy: { date: "desc" },
        take: 10,
      },
      memberFees: {
        include: { fee: { select: { amount: true } } },
      },
    },
  });

  if (!member) return null;

  return {
    ...member,
    accumulatedDebt: calculateDebt(member.memberFees),
  };
}

export async function createMember(data: CreateMemberInput) {
  const existing = await prisma.member.findUnique({
    where: { dni: data.dni },
  });
  if (existing) {
    throw new AppError("Ya existe un socio con ese DNI", "DNI_EXISTS", 400);
  }

  return prisma.member.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      dni: data.dni,
      birthDate: new Date(data.birthDate),
      contact: data.contact,
      socialFeePaid: data.socialFeePaid ?? false,
      accumulatedDebt: data.accumulatedDebt ?? 0,
    },
  });
}

export async function updateMember(id: number, data: UpdateMemberInput) {
  if (data.dni) {
    const existing = await prisma.member.findFirst({
      where: { dni: data.dni, NOT: { id } },
    });
    if (existing) {
      throw new AppError("Ya existe un socio con ese DNI", "DNI_EXISTS", 400);
    }
  }

  return prisma.member.update({
    where: { id },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      dni: data.dni,
      birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
      contact: data.contact,
      socialFeePaid: data.socialFeePaid,
      accumulatedDebt: data.accumulatedDebt,
    },
  });
}

export async function deleteMember(id: number) {
  return prisma.member.delete({ where: { id } });
}
