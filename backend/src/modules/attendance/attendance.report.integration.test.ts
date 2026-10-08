import assert from "node:assert/strict";
import test, { after, before } from "node:test";
import { setupTestDb } from "../../test/testDb";

const { cleanup } = setupTestDb();

let prisma: typeof import("../../lib/prisma").default;
let getAttendanceReport: typeof import("./attendance.service").getAttendanceReport;
let ids: { prof1: number; prof2: number; futbolClass: number; voleyClass: number; disciplineFutbol: number };

const day = (d: number) => new Date(Date.UTC(2026, 0, d));

before(async () => {
  prisma = (await import("../../lib/prisma")).default;
  ({ getAttendanceReport } = await import("./attendance.service"));

  const role = await prisma.role.create({ data: { name: "Professor" } });
  const mkProf = (u: string) =>
    prisma.user.create({ data: { username: u, email: `${u}@x.com`, firstName: u, lastName: "P", password: "x", roleId: role.id } });
  const [prof1, prof2] = [await mkProf("p1"), await mkProf("p2")];

  const futbol = await prisma.discipline.create({ data: { name: "Fútbol" } });
  const voley = await prisma.discipline.create({ data: { name: "Vóley" } });
  const fc = await prisma.groupClass.create({ data: { disciplineId: futbol.id, userId: prof1.id, schedule: "18-19", days: "Lun" } });
  const vc = await prisma.groupClass.create({ data: { disciplineId: voley.id, userId: prof2.id, schedule: "19-20", days: "Mar" } });

  const mkMember = (n: string, dni: string) =>
    prisma.member.create({ data: { firstName: n, lastName: "M", dni, birthDate: new Date("1990-01-01") } });
  const [ana, beto] = [await mkMember("Ana", "1"), await mkMember("Beto", "2")];

  // Fútbol: Ana siempre presente, Beto siempre ausente (4 clases). Vóley: Ana presente 1 vez.
  for (let d = 1; d <= 4; d++) {
    await prisma.attendance.create({ data: { groupClassId: fc.id, memberId: ana.id, date: day(d), present: true } });
    await prisma.attendance.create({ data: { groupClassId: fc.id, memberId: beto.id, date: day(d), present: false } });
  }
  await prisma.attendance.create({ data: { groupClassId: vc.id, memberId: ana.id, date: day(2), present: true } });

  ids = { prof1: prof1.id, prof2: prof2.id, futbolClass: fc.id, voleyClass: vc.id, disciplineFutbol: futbol.id };
});

after(cleanup);

test("el reporte agrega totales, sesiones y tasa de asistencia", async () => {
  const r = await getAttendanceReport({});
  assert.equal(r.summary.totalRecords, 9);
  assert.equal(r.summary.totalPresents, 5);
  assert.equal(r.summary.sessions, 5);
  assert.equal(r.summary.attendanceRate, 56);
  assert.equal(r.byDiscipline.length, 2);
  assert.equal(r.byDiscipline[0].name, "Fútbol");
});

test("filtra por rango de fechas inclusivo", async () => {
  const r = await getAttendanceReport({ from: "2026-01-02", to: "2026-01-03" });
  assert.deepEqual(r.byDay.map((d) => d.date), ["2026-01-02", "2026-01-03"]);
});

test("filtra por disciplina y por clase", async () => {
  const byDisc = await getAttendanceReport({ disciplineId: ids.disciplineFutbol });
  assert.equal(byDisc.summary.totalRecords, 8);
  const byClass = await getAttendanceReport({ groupClassId: ids.voleyClass });
  assert.equal(byClass.summary.totalRecords, 1);
});

test("un profesor solo ve las clases que dicta", async () => {
  const r = await getAttendanceReport({ professorId: ids.prof2 });
  assert.equal(r.summary.totalRecords, 1);
  assert.deepEqual(r.byClass.map((c) => c.classId), [ids.voleyClass]);
});

test("detecta socios con baja asistencia (mínimo 3 registros)", async () => {
  const r = await getAttendanceReport({});
  assert.deepEqual(r.lowAttendanceMembers.map((m) => m.name), ["Beto M"]);
  assert.equal(r.lowAttendanceMembers[0].attendanceRate, 0);
});
