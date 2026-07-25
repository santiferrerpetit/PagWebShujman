import prisma from "../../lib/prisma";
import { AppError } from "../../lib/AppError";
import { getCategoryFromBirthDate } from "../../lib/category";
import type { CreateMemberInput, UpdateMemberInput } from "./members.schema";

function calculateTotalDebt(
  memberFees: { paid: boolean; fee: { amount: any } }[],
  memberSocialFees: { paid: boolean; amount: any }[]
): number {
  const sportsDebt = memberFees
    .filter((mf) => !mf.paid)
    .reduce((sum, mf) => sum + Number(mf.fee.amount), 0);
  const socialDebt = memberSocialFees
    .filter((msf) => !msf.paid)
    .reduce((sum, msf) => sum + Number(msf.amount), 0);
  return sportsDebt + socialDebt;
}

export async function getAllMembers() {
  const members = await prisma.member.findMany({
    orderBy: { lastName: "asc" },
    include: {
      memberFees: {
        include: { fee: { select: { amount: true } } },
      },
      memberSocialFees: {
        include: { socialFee: { select: { category: true } } },
      },
    },
  });

  return members.map((member) => ({
    ...member,
    category: getCategoryFromBirthDate(member.birthDate),
    accumulatedDebt: calculateTotalDebt(member.memberFees, member.memberSocialFees),
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
      memberSocialFees: {
        include: { socialFee: { select: { category: true } } },
      },
    },
  });

  if (!member) return null;

  return {
    ...member,
    category: getCategoryFromBirthDate(member.birthDate),
    accumulatedDebt: calculateTotalDebt(member.memberFees, member.memberSocialFees),
  };
}

export async function createMember(data: CreateMemberInput) {
  const existing = await prisma.member.findUnique({
    where: { dni: data.dni },
  });
  if (existing) {
    throw new AppError("Ya existe un socio con ese DNI", "DNI_EXISTS", 400);
  }

  const member = await prisma.member.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      dni: data.dni,
      birthDate: new Date(data.birthDate),
      email: data.email || null,
      phone: data.phone || null,
      isActive: data.isActive ?? true,
    },
  });

  // Asignar cuota social automáticamente para el mes/año actual
  const category = getCategoryFromBirthDate(member.birthDate);
  const socialFee = await prisma.socialFee.findUnique({
    where: { category },
  });

  if (socialFee && member.isActive) {
    const now = new Date();
    await prisma.memberSocialFee.create({
      data: {
        memberId: member.id,
        socialFeeId: socialFee.id,
        periodMonth: now.getMonth() + 1,
        periodYear: now.getFullYear(),
        amount: socialFee.amount,
      },
    });
  }

  return member;
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

  const updated = await prisma.member.update({
    where: { id },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      dni: data.dni,
      birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
      email: data.email,
      phone: data.phone,
      isActive: data.isActive,
    },
  });

  return updated;
}

export async function toggleMemberActive(id: number) {
  const member = await prisma.member.findUnique({ where: { id } });
  if (!member) {
    throw new AppError("Socio no encontrado", "MEMBER_NOT_FOUND", 404);
  }

  const updated = await prisma.member.update({
    where: { id },
    data: { isActive: !member.isActive },
  });

  return updated;
}

export async function deleteMember(id: number) {
  return prisma.member.delete({ where: { id } });
}
