import prisma from "../../lib/prisma";
import { AppError } from "../../lib/AppError";
import { getCategoryFromBirthDate } from "../../lib/category";
import type { CreateFeeInput, UpdateFeeInput, AssignFeeInput, ToggleFeePaidInput } from "./fees.schema";

export async function getAllFees() {
  return prisma.sportsFee.findMany({
    where: { active: true },
    include: { discipline: { select: { id: true, name: true } } },
    orderBy: { name: "asc" },
  });
}

export async function getFeeById(id: number) {
  return prisma.sportsFee.findUnique({
    where: { id },
    include: {
      discipline: { select: { id: true, name: true } },
      memberFees: {
        include: {
          member: {
            select: { id: true, firstName: true, lastName: true, dni: true },
          },
        },
      },
    },
  });
}

export async function createFee(data: CreateFeeInput) {
  return prisma.sportsFee.create({
    data: {
      name: data.name,
      amount: data.amount,
      category: data.category,
      disciplineId: data.disciplineId,
      description: data.description,
      active: data.active ?? true,
    },
    include: { discipline: { select: { id: true, name: true } } },
  });
}

export async function updateFee(id: number, data: UpdateFeeInput) {
  return prisma.sportsFee.update({
    where: { id },
    data: {
      name: data.name,
      amount: data.amount,
      category: data.category,
      disciplineId: data.disciplineId,
      description: data.description,
      active: data.active,
    },
    include: { discipline: { select: { id: true, name: true } } },
  });
}

export async function deleteFee(id: number) {
  return prisma.sportsFee.delete({ where: { id } });
}

export async function assignFeeToMember(data: AssignFeeInput) {
  const member = await prisma.member.findUnique({
    where: { id: data.memberId },
  });
  if (!member) {
    throw new AppError("Socio no encontrado", "MEMBER_NOT_FOUND", 404);
  }
  if (!member.isActive) {
    throw new AppError("No se pueden asignar aranceles a socios inactivos", "MEMBER_INACTIVE", 400);
  }

  const fee = await prisma.sportsFee.findUnique({
    where: { id: data.feeId },
  });
  if (!fee) {
    throw new AppError("Arancel no encontrado", "FEE_NOT_FOUND", 404);
  }

  const memberCategory = getCategoryFromBirthDate(member.birthDate);
  if (fee.category !== memberCategory) {
    throw new AppError(
      `Este arancel es para categoría "${fee.category}" pero el socio es "${memberCategory}"`,
      "CATEGORY_MISMATCH",
      400
    );
  }

  const existing = await prisma.memberFee.findUnique({
    where: { memberId_feeId: { memberId: data.memberId, feeId: data.feeId } },
  });
  if (existing) {
    throw new AppError("Este arancel ya está asignado al socio", "FEE_ALREADY_ASSIGNED", 400);
  }

  return prisma.memberFee.create({
    data: {
      memberId: data.memberId,
      feeId: data.feeId,
      paid: data.paid ?? false,
      paidAt: data.paid ? new Date() : null,
    },
    include: {
      fee: { include: { discipline: { select: { id: true, name: true } } } },
      member: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

export async function toggleFeePaid(data: ToggleFeePaidInput) {
  const memberFee = await prisma.memberFee.findUnique({
    where: { memberId_feeId: { memberId: data.memberId, feeId: data.feeId } },
  });
  if (!memberFee) {
    throw new AppError("El arancel no está asignado a este socio", "FEE_NOT_ASSIGNED", 404);
  }

  return prisma.memberFee.update({
    where: { id: memberFee.id },
    data: {
      paid: data.paid,
      paidAt: data.paid ? new Date() : null,
    },
    include: {
      fee: { include: { discipline: { select: { id: true, name: true } } } },
      member: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

export async function removeFeeFromMember(memberId: number, feeId: number) {
  const memberFee = await prisma.memberFee.findUnique({
    where: { memberId_feeId: { memberId, feeId } },
  });
  if (!memberFee) {
    throw new AppError("El arancel no está asignado a este socio", "FEE_NOT_ASSIGNED", 404);
  }

  return prisma.memberFee.delete({ where: { id: memberFee.id } });
}

export async function getMemberFees(memberId: number) {
  return prisma.memberFee.findMany({
    where: { memberId },
    include: { fee: { include: { discipline: { select: { id: true, name: true } } } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllMemberFees() {
  return prisma.memberFee.findMany({
    include: {
      fee: { include: { discipline: { select: { id: true, name: true } } } },
      member: { select: { id: true, firstName: true, lastName: true, dni: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
