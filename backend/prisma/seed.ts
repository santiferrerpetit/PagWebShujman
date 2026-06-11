import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const url = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url });
const prisma = new PrismaClient({ adapter });

async function main() {
  // --- Roles ---
  const existingRoles = await prisma.role.count();
  if (existingRoles === 0) {
    await prisma.role.create({ data: { name: "Administrator" } });
    await prisma.role.create({ data: { name: "Professor" } });
    await prisma.role.create({ data: { name: "Maintenance" } });
    console.log("Roles created");
  } else {
    console.log("Roles already exist, skipping");
  }

  // --- Admin user ---
  const existingAdmin = await prisma.user.findUnique({ where: { username: "admin" } });
  if (!existingAdmin) {
    const adminRole = await prisma.role.findFirst({ where: { name: "Administrator" } });
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await prisma.user.create({
      data: {
        username: "admin",
        email: "admin@club.com",
        firstName: "Admin",
        lastName: "Principal",
        password: hashedPassword,
        roleId: adminRole!.id,
      },
    });
    console.log("Admin user created");
  } else {
    console.log("Admin user already exists, skipping");
  }

  // --- Profesores ---
  const prof1 = await prisma.user.findFirst({ where: { email: "profe1@club.com" } });
  let profe1Id = prof1?.id;
  if (!prof1) {
    const profRole = await prisma.role.findFirst({ where: { name: "Professor" } });
    const p = await prisma.user.create({
      data: {
        username: "profe1",
        email: "profe1@club.com",
        firstName: "Roberto",
        lastName: "García",
        password: await bcrypt.hash("prof123", 10),
        roleId: profRole!.id,
      },
    });
    profe1Id = p.id;
    console.log("Profesor Roberto García creado");
  }

  const prof2 = await prisma.user.findFirst({ where: { email: "profe2@club.com" } });
  let profe2Id = prof2?.id;
  if (!prof2) {
    const profRole = await prisma.role.findFirst({ where: { name: "Professor" } });
    const p = await prisma.user.create({
      data: {
        username: "profe2",
        email: "profe2@club.com",
        firstName: "Laura",
        lastName: "Martínez",
        password: await bcrypt.hash("prof123", 10),
        roleId: profRole!.id,
      },
    });
    profe2Id = p.id;
    console.log("Profesora Laura Martínez creada");
  }
  // --- Skip if already seeded ---
  const existingMembers = await prisma.member.count();
  if (existingMembers > 0) {
    console.log("Members already exist, skipping seed");
    return;
  }

  // --- Cuotas Sociales por categoría ---
  await prisma.socialFee.create({ data: { category: "Infantil", amount: 500, dueDay: 10 } });
  await prisma.socialFee.create({ data: { category: "Juvenil", amount: 800, dueDay: 10 } });
  await prisma.socialFee.create({ data: { category: "Adulto", amount: 1000, dueDay: 10 } });
  await prisma.socialFee.create({ data: { category: "Senior", amount: 700, dueDay: 10 } });
  console.log("Cuotas sociales creadas");

  // --- Disciplinas ---
  const futbol = await prisma.discipline.create({ data: { name: "Fútbol" } });
  const basquet = await prisma.discipline.create({ data: { name: "Básquet" } });
  const voley = await prisma.discipline.create({ data: { name: "Vóley" } });
  const natacion = await prisma.discipline.create({ data: { name: "Natación" } });
  console.log("4 disciplinas creadas");

  // --- Grupos de práctica ---
  const futbolAdultos = await prisma.groupClass.create({
    data: { disciplineId: futbol.id, userId: profe1Id!, schedule: "20:00 - 22:00", days: "Lunes, Miércoles" },
  });
  const futbolJuveniles = await prisma.groupClass.create({
    data: { disciplineId: futbol.id, userId: profe1Id!, schedule: "18:00 - 20:00", days: "Martes, Jueves" },
  });
  const basquetAdultos = await prisma.groupClass.create({
    data: { disciplineId: basquet.id, userId: profe2Id!, schedule: "19:00 - 21:00", days: "Lunes, Miércoles, Viernes" },
  });
  const voleyMixto = await prisma.groupClass.create({
    data: { disciplineId: voley.id, userId: profe2Id!, schedule: "18:00 - 20:00", days: "Martes, Jueves" },
  });
  const natacionInfantil = await prisma.groupClass.create({
    data: { disciplineId: natacion.id, userId: profe1Id!, schedule: "17:00 - 18:30", days: "Lunes, Miércoles, Viernes" },
  });
  console.log("5 grupos de práctica creados");

  // --- Aranceles Deportivos vinculados a disciplinas ---
  const feeFutbolAdulto = await prisma.sportsFee.create({
    data: { name: "Fútbol Adulto", amount: 1500, category: "Adulto", disciplineId: futbol.id },
  });
  const feeFutbolJuvenil = await prisma.sportsFee.create({
    data: { name: "Fútbol Juvenil", amount: 1200, category: "Juvenil", disciplineId: futbol.id },
  });
  const feeFutbolInfantil = await prisma.sportsFee.create({
    data: { name: "Fútbol Infantil", amount: 900, category: "Infantil", disciplineId: futbol.id },
  });
  const feeBasquetAdulto = await prisma.sportsFee.create({
    data: { name: "Básquet Adulto", amount: 1300, category: "Adulto", disciplineId: basquet.id },
  });
  const feeVoleyAdulto = await prisma.sportsFee.create({
    data: { name: "Vóley Adulto", amount: 1100, category: "Adulto", disciplineId: voley.id },
  });
  const feeNatacionInfantil = await prisma.sportsFee.create({
    data: { name: "Natación Infantil", amount: 1000, category: "Infantil", disciplineId: natacion.id },
  });
  console.log("6 aranceles deportivos creados vinculados a disciplinas");

  // --- Socios ---
  const juan = await prisma.member.create({
    data: { firstName: "Juan", lastName: "Perez", dni: "12345678", birthDate: new Date("1990-05-15"), email: "juan@example.com", phone: "341-555-1001", isActive: true },
  });
  const maria = await prisma.member.create({
    data: { firstName: "Maria", lastName: "Garcia", dni: "23456789", birthDate: new Date("2008-08-22"), email: "maria@example.com", phone: "341-555-1002", isActive: true },
  });
  const carlos = await prisma.member.create({
    data: { firstName: "Carlos", lastName: "Lopez", dni: "34567890", birthDate: new Date("1960-11-30"), email: "carlos@example.com", phone: "341-555-1003", isActive: false },
  });
  const lucia = await prisma.member.create({
    data: { firstName: "Lucia", lastName: "Martinez", dni: "45678901", birthDate: new Date("1995-02-10"), email: "lucia@example.com", phone: "341-555-1004", isActive: true },
  });
  const tomas = await prisma.member.create({
    data: { firstName: "Tomas", lastName: "Gomez", dni: "56789012", birthDate: new Date("2015-03-12"), email: "tomas@example.com", phone: "341-555-1005", isActive: true },
  });
  console.log("5 socios creados");

  // --- Cuotas sociales del mes ---
  const now = new Date();
  for (const [member, category] of [
    [juan, "Adulto"],
    [maria, "Juvenil"],
    [lucia, "Adulto"],
    [tomas, "Infantil"],
  ] as const) {
    const sf = await prisma.socialFee.findUnique({ where: { category } });
    if (sf) {
      await prisma.memberSocialFee.create({
        data: {
          memberId: member.id,
          socialFeeId: sf.id,
          periodMonth: now.getMonth() + 1,
          periodYear: now.getFullYear(),
          amount: sf.amount,
        },
      });
    }
  }
  console.log("Cuotas sociales del mes asignadas");

  // --- Inscripciones a grupos (con aranceles automáticos) ---
  // Juan (Adulto) → Fútbol Adultos → Fútbol Adulto $1500
  await prisma.memberGroup.create({
    data: { memberId: juan.id, groupClassId: futbolAdultos.id },
  });
  await prisma.memberFee.create({
    data: { memberId: juan.id, feeId: feeFutbolAdulto.id, paid: true, paidAt: new Date() },
  });

  // Juan (Adulto) → Básquet Adultos → Básquet Adulto $1300 (pendiente)
  await prisma.memberGroup.create({
    data: { memberId: juan.id, groupClassId: basquetAdultos.id },
  });
  await prisma.memberFee.create({
    data: { memberId: juan.id, feeId: feeBasquetAdulto.id, paid: false },
  });

  // Maria (Juvenil) → Fútbol Juveniles → Fútbol Juvenil $1200
  await prisma.memberGroup.create({
    data: { memberId: maria.id, groupClassId: futbolJuveniles.id },
  });
  await prisma.memberFee.create({
    data: { memberId: maria.id, feeId: feeFutbolJuvenil.id, paid: true, paidAt: new Date() },
  });

  // Lucia (Adulto) → Vóley Mixto → Vóley Adulto $1100
  await prisma.memberGroup.create({
    data: { memberId: lucia.id, groupClassId: voleyMixto.id },
  });
  await prisma.memberFee.create({
    data: { memberId: lucia.id, feeId: feeVoleyAdulto.id, paid: true, paidAt: new Date() },
  });

  // Tomas (Infantil) → Natación Infantil → Natación Infantil $1000 (pendiente)
  await prisma.memberGroup.create({
    data: { memberId: tomas.id, groupClassId: natacionInfantil.id },
  });
  await prisma.memberFee.create({
    data: { memberId: tomas.id, feeId: feeNatacionInfantil.id, paid: false },
  });

  // Carlos (Senior, inactivo) → sin inscripciones

  console.log("Inscripciones a grupos y aranceles deportivos creados");

  console.log("\n✅ Seed completo: roles, admin, profesores, disciplinas, grupos, cuotas sociales, socios, aranceles e inscripciones");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
