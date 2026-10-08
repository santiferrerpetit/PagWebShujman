export type SocialFeeLine = {
  periodMonth: number;
  periodYear: number;
  amount: number;
  paid: boolean;
  dueDay: number;
};

/** Fecha de vencimiento de una cuota social (el día se ajusta al último día del mes si no existe). */
export function getDueDate(periodMonth: number, periodYear: number, dueDay: number): Date {
  const lastDay = new Date(periodYear, periodMonth, 0).getDate();
  return new Date(periodYear, periodMonth - 1, Math.min(dueDay, lastDay), 23, 59, 59);
}

export function isSocialFeeOverdue(fee: SocialFeeLine, now: Date = new Date()): boolean {
  return !fee.paid && getDueDate(fee.periodMonth, fee.periodYear, fee.dueDay) < now;
}

export type Balance = {
  pendingTotal: number;
  overdueTotal: number;
  paidTotal: number;
};

export function computeBalance(
  socialFees: SocialFeeLine[],
  sportsFees: { amount: number; paid: boolean }[],
  now: Date = new Date(),
): Balance {
  let pendingTotal = 0;
  let overdueTotal = 0;
  let paidTotal = 0;

  for (const f of socialFees) {
    if (f.paid) {
      paidTotal += f.amount;
    } else {
      pendingTotal += f.amount;
      if (isSocialFeeOverdue(f, now)) overdueTotal += f.amount;
    }
  }
  for (const f of sportsFees) {
    if (f.paid) paidTotal += f.amount;
    else pendingTotal += f.amount;
  }

  return { pendingTotal, overdueTotal, paidTotal };
}
