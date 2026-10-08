import prisma from "../../lib/prisma";
import { AppError } from "../../lib/AppError";
import { computeBalance, getDueDate, isSocialFeeOverdue } from "./account.calc";

/** Estado de cuenta completo de un socio: cuotas sociales + aranceles deportivos. */
export async function getMemberAccount(memberId: number) {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: { id: true, firstName: true, lastName: true, dni: true, isActive: true },
  });
  if (!member) {
    throw new AppError("Socio no encontrado", "MEMBER_NOT_FOUND", 404);
  }

  const [socialFees, sportsFees] = await Promise.all([
    prisma.memberSocialFee.findMany({
      where: { memberId },
      include: { socialFee: { select: { category: true, dueDay: true } } },
      orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }],
    }),
    prisma.memberFee.findMany({
      where: { memberId },
      include: { fee: { select: { name: true, amount: true, discipline: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const now = new Date();
  const social = socialFees.map((f) => {
    const line = {
      periodMonth: f.periodMonth,
      periodYear: f.periodYear,
      amount: Number(f.amount),
      paid: f.paid,
      dueDay: f.socialFee.dueDay,
    };
    return {
      id: f.id,
      category: f.socialFee.category,
      ...line,
      dueDate: getDueDate(f.periodMonth, f.periodYear, f.socialFee.dueDay),
      paidAt: f.paidAt,
      overdue: isSocialFeeOverdue(line, now),
    };
  });
  const sports = sportsFees.map((f) => ({
    id: f.id,
    feeId: f.feeId,
    name: f.fee.name,
    discipline: f.fee.discipline.name,
    amount: Number(f.fee.amount),
    paid: f.paid,
    paidAt: f.paidAt,
  }));

  return {
    member,
    balance: computeBalance(social, sports, now),
    socialFees: social,
    sportsFees: sports,
  };
}

/** Resumen de deuda de todos los socios activos con algún saldo pendiente (para el panel de morosos). */
export async function getAccountsSummary() {
  const members = await prisma.member.findMany({
    where: {
      isActive: true,
      OR: [{ memberSocialFees: { some: { paid: false } } }, { memberFees: { some: { paid: false } } }],
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      dni: true,
      memberSocialFees: {
        where: { paid: false },
        include: { socialFee: { select: { dueDay: true } } },
      },
      memberFees: {
        where: { paid: false },
        include: { fee: { select: { amount: true } } },
      },
    },
  });

  const now = new Date();
  const rows = members.map((m) => {
    const social = m.memberSocialFees.map((f) => ({
      periodMonth: f.periodMonth,
      periodYear: f.periodYear,
      amount: Number(f.amount),
      paid: false,
      dueDay: f.socialFee.dueDay,
    }));
    const sports = m.memberFees.map((f) => ({ amount: Number(f.fee.amount), paid: false }));
    const balance = computeBalance(social, sports, now);
    return {
      memberId: m.id,
      firstName: m.firstName,
      lastName: m.lastName,
      dni: m.dni,
      pendingCount: social.length + sports.length,
      overdueCount: social.filter((f) => isSocialFeeOverdue(f, now)).length,
      pendingTotal: balance.pendingTotal,
      overdueTotal: balance.overdueTotal,
    };
  });

  rows.sort((a, b) => b.overdueTotal - a.overdueTotal || b.pendingTotal - a.pendingTotal);

  return {
    totals: {
      debtors: rows.filter((r) => r.overdueTotal > 0).length,
      pendingTotal: rows.reduce((n, r) => n + r.pendingTotal, 0),
      overdueTotal: rows.reduce((n, r) => n + r.overdueTotal, 0),
    },
    members: rows,
  };
}
