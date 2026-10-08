import assert from "node:assert/strict";
import test, { after, before } from "node:test";
import { setupTestDb } from "../../test/testDb";

const { cleanup } = setupTestDb();

let getMemberAccount: typeof import("./account.service").getMemberAccount;
let getAccountsSummary: typeof import("./account.service").getAccountsSummary;
let memberId: number;

before(async () => {
  const prisma = (await import("../../lib/prisma")).default;
  ({ getMemberAccount, getAccountsSummary } = await import("./account.service"));

  const member = await prisma.member.create({
    data: { firstName: "Ana", lastName: "Gómez", dni: "10", birthDate: new Date("1990-01-01") },
  });
  await prisma.member.create({
    data: { firstName: "Al día", lastName: "Socio", dni: "11", birthDate: new Date("1990-01-01") },
  });
  memberId = member.id;

  const social = await prisma.socialFee.create({ data: { category: "Adulto", amount: 1000, dueDay: 10 } });
  // Período muy antiguo (vencido) y otro muy lejano (no vencido) + uno pagado
  await prisma.memberSocialFee.create({ data: { memberId, socialFeeId: social.id, periodMonth: 1, periodYear: 2020, amount: 1000 } });
  await prisma.memberSocialFee.create({ data: { memberId, socialFeeId: social.id, periodMonth: 12, periodYear: 2099, amount: 1200 } });
  await prisma.memberSocialFee.create({ data: { memberId, socialFeeId: social.id, periodMonth: 2, periodYear: 2020, amount: 900, paid: true, paidAt: new Date() } });

  const disc = await prisma.discipline.create({ data: { name: "Fútbol" } });
  const sports = await prisma.sportsFee.create({ data: { name: "Fútbol Adulto", amount: 500, category: "Adulto", disciplineId: disc.id } });
  await prisma.memberFee.create({ data: { memberId, feeId: sports.id } });
});

after(cleanup);

test("el estado de cuenta separa pendiente, vencido y pagado", async () => {
  const acc = await getMemberAccount(memberId);
  assert.deepEqual(acc.balance, { pendingTotal: 2700, overdueTotal: 1000, paidTotal: 900 });
  assert.equal(acc.socialFees.length, 3);
  assert.equal(acc.socialFees.filter((f) => f.overdue).length, 1);
  assert.equal(acc.sportsFees[0].paid, false);
});

test("un socio inexistente devuelve 404", async () => {
  await assert.rejects(() => getMemberAccount(99999), { statusCode: 404 });
});

test("el resumen lista solo socios con deuda, ordenados por mora", async () => {
  const s = await getAccountsSummary();
  assert.equal(s.members.length, 1);
  assert.equal(s.members[0].memberId, memberId);
  assert.equal(s.members[0].overdueCount, 1);
  assert.deepEqual(s.totals, { debtors: 1, pendingTotal: 2700, overdueTotal: 1000 });
});
