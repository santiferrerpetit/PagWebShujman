import prisma from "../../lib/prisma";
import { AppError } from "../../lib/AppError";
import { getCategoryFromBirthDate } from "../../lib/category";
import type {
  CreateSocialFeeInput,
  UpdateSocialFeeInput,
  ToggleSocialFeePaidInput,
  GenerateMonthInput,
} from "./social-fees.schema";

export async function getAllSocialFees() {
  return prisma.socialFee.findMany({
    orderBy: { category: "asc" },
  });
}

export async function getSocialFeeById(id: number) {
  return prisma.socialFee.findUnique({
    where: { id },
  });
}

export async function createSocialFee(data: CreateSocialFeeInput) {
  const existing = await prisma.socialFee.findUnique({
    where: { category: data.category },
  });
  if (existing) {
    throw new AppError(
      `Ya existe una cuota social para la categoría ${data.category}`,
      "SOCIAL_FEE_EXISTS",
      400
    );
  }

  return prisma.socialFee.create({
    data: {
      category: data.category,
      amount: data.amount,
      dueDay: data.dueDay,
      active: data.active ?? true,
    },
  });
}

export async function updateSocialFee(id: number, data: UpdateSocialFeeInput) {
  return prisma.socialFee.update({
    where: { id },
    data: {
      category: data.category,
      amount: data.amount,
      dueDay: data.dueDay,
      active: data.active,
    },
  });
}

export async function deleteSocialFee(id: number) {
  return prisma.socialFee.delete({ where: { id } });
}

export async function getMemberSocialFees(memberId: number) {
  return prisma.memberSocialFee.findMany({
    where: { memberId },
    include: { socialFee: true },
    orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }],
  });
}

export async function toggleSocialFeePaid(data: ToggleSocialFeePaidInput) {
  const msf = await prisma.memberSocialFee.findUnique({
    where: { id: data.memberSocialFeeId },
  });
  if (!msf) {
    throw new AppError("Cuota social no encontrada", "NOT_FOUND", 404);
  }

  return prisma.memberSocialFee.update({
    where: { id: data.memberSocialFeeId },
    data: {
      paid: data.paid,
      paidAt: data.paid ? new Date() : null,
    },
    include: {
      socialFee: true,
      member: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

export async function generateMonthFees(data: GenerateMonthInput) {
  const members = await prisma.member.findMany({
    where: { isActive: true },
  });

  let created = 0;
  for (const member of members) {
    const category = getCategoryFromBirthDate(member.birthDate);
    const socialFee = await prisma.socialFee.findUnique({
      where: { category },
    });
    if (!socialFee) continue;

    const exists = await prisma.memberSocialFee.findUnique({
      where: {
        memberId_periodMonth_periodYear: {
          memberId: member.id,
          periodMonth: data.month,
          periodYear: data.year,
        },
      },
    });

    if (!exists) {
      await prisma.memberSocialFee.create({
        data: {
          memberId: member.id,
          socialFeeId: socialFee.id,
          periodMonth: data.month,
          periodYear: data.year,
          amount: socialFee.amount,
        },
      });
      created++;
    }
  }

  return { created };
}
