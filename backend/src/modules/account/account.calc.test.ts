import assert from "node:assert/strict";
import test from "node:test";
import { computeBalance, getDueDate, isSocialFeeOverdue } from "./account.calc";

test("getDueDate ajusta el día al último día del mes", () => {
  const due = getDueDate(2, 2025, 31);
  assert.equal(due.getMonth(), 1);
  assert.equal(due.getDate(), 28);
});

test("una cuota impaga pasada su vencimiento está en mora", () => {
  const fee = { periodMonth: 1, periodYear: 2025, amount: 100, paid: false, dueDay: 10 };
  assert.equal(isSocialFeeOverdue(fee, new Date(2025, 1, 1)), true);
  assert.equal(isSocialFeeOverdue(fee, new Date(2025, 0, 5)), false);
  assert.equal(isSocialFeeOverdue({ ...fee, paid: true }, new Date(2025, 1, 1)), false);
});

test("computeBalance separa pendiente, vencido y pagado", () => {
  const now = new Date(2025, 2, 15);
  const balance = computeBalance(
    [
      { periodMonth: 1, periodYear: 2025, amount: 100, paid: false, dueDay: 10 },
      { periodMonth: 3, periodYear: 2025, amount: 120, paid: false, dueDay: 20 },
      { periodMonth: 2, periodYear: 2025, amount: 100, paid: true, dueDay: 10 },
    ],
    [
      { amount: 50, paid: false },
      { amount: 30, paid: true },
    ],
    now,
  );
  assert.deepEqual(balance, { pendingTotal: 270, overdueTotal: 100, paidTotal: 130 });
});
