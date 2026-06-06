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
  console.log("Cuotas sociales creadas (Infantil, Juvenil, Adulto, Senior)");

  // --- Socios ---
  const juan = await prisma.member.create({
    data: { firstName: "Juan", lastName: "Perez", dni: "12345678", birthDate: new Date("1990-05-15"), contact: "juan@example.com", isActive: true },
  });
  const maria = await prisma.member.create({
    data: { firstName: "Maria", lastName: "Garcia", dni: "23456789", birthDate: new Date("2008-08-22"), contact: "maria@example.com", isActive: true },
  });
  const carlos = await prisma.member.create({
    data: { firstName: "Carlos", lastName: "Lopez", dni: "34567890", birthDate: new Date("1960-11-30"), contact: "carlos@example.com", isActive: false },
  });
  const lucia = await prisma.member.create({
    data: { firstName: "Lucia", lastName: "Martinez", dni: "45678901", birthDate: new Date("1995-02-10"), contact: "lucia@example.com", isActive: true },
  });
  const tomas = await prisma.member.create({
    data: { firstName: "Tomas", lastName: "Gomez", dni: "56789012", birthDate: new Date("2015-03-12"), contact: "tomas@example.com", isActive: true },
  });
  console.log("5 socios creados (1 inactivo: Carlos)");

  // --- Aranceles Deportivos con categoría ---
  const futbolAdulto = await prisma.sportsFee.create({ data: { name: "Fútbol Adulto", amount: 1500, category: "Adulto", description: "Arancel mensual de Fútbol - Adulto" } });
  const futbolJuvenil = await prisma.sportsFee.create({ data: { name: "Fútbol Juvenil", amount: 1200, category: "Juvenil", description: "Arancel mensual de Fútbol - Juvenil" } });
  const basquetAdulto = await prisma.sportsFee.create({ data: { name: "Básquet Adulto", amount: 1300, category: "Adulto", description: "Arancel mensual de Básquet - Adulto" } });
  const voleyAdulto = await prisma.sportsFee.create({ data: { name: "Vóley Adulto", amount: 1100, category: "Adulto", description: "Arancel mensual de Vóley - Adulto" } });
  const natacionInfantil = await prisma.sportsFee.create({ data: { name: "Natación Infantil", amount: 1000, category: "Infantil", description: "Arancel mensual de Natación - Infantil" } });
  const seniorGimnasia = await prisma.sportsFee.create({ data: { name: "Gimnasia Senior", amount: 900, category: "Senior", description: "Arancel mensual de Gimnasia - Senior" } });
  console.log("6 aranceles deportivos creados");

  // --- Cuotas sociales automáticas (creadas al registrar socio) ---
  // Juan (Adulto) → cuota social Adulto
  const now = new Date();
  const sfJuan = await prisma.socialFee.findUnique({ where: { category: "Adulto" } });
  if (sfJuan) {
    await prisma.memberSocialFee.create({
      data: { memberId: juan.id, socialFeeId: sfJuan.id, periodMonth: now.getMonth() + 1, periodYear: now.getFullYear(), amount: sfJuan.amount },
    });
  }

  // Maria (Juvenil) → cuota social Juvenil
  const sfMaria = await prisma.socialFee.findUnique({ where: { category: "Juvenil" } });
  if (sfMaria) {
    await prisma.memberSocialFee.create({
      data: { memberId: maria.id, socialFeeId: sfMaria.id, periodMonth: now.getMonth() + 1, periodYear: now.getFullYear(), amount: sfMaria.amount },
    });
  }

  // Carlos (Senior, inactivo) → sin cuota social ni aranceles

  // Lucia (Adulto) → cuota social Adulto
  const sfLucia = await prisma.socialFee.findUnique({ where: { category: "Adulto" } });
  if (sfLucia) {
    await prisma.memberSocialFee.create({
      data: { memberId: lucia.id, socialFeeId: sfLucia.id, periodMonth: now.getMonth() + 1, periodYear: now.getFullYear(), amount: sfLucia.amount },
    });
  }

  // Tomas (Infantil) → cuota social Infantil
  const sfTomas = await prisma.socialFee.findUnique({ where: { category: "Infantil" } });
  if (sfTomas) {
    await prisma.memberSocialFee.create({
      data: { memberId: tomas.id, socialFeeId: sfTomas.id, periodMonth: now.getMonth() + 1, periodYear: now.getFullYear(), amount: sfTomas.amount },
    });
  }
  console.log("Cuotas sociales del mes asignadas a socios activos");

  // --- Asignaciones de aranceles deportivos ---
  // Juan: Fútbol Adulto ✅, Básquet Adulto ❌
  await prisma.memberFee.create({ data: { memberId: juan.id, feeId: futbolAdulto.id, paid: true, paidAt: new Date() } });
  await prisma.memberFee.create({ data: { memberId: juan.id, feeId: basquetAdulto.id, paid: false } });

  // Maria: Fútbol Juvenil ✅, Vóley Adulto ❌ (por edad se asigna Juvenil)
  await prisma.memberFee.create({ data: { memberId: maria.id, feeId: futbolJuvenil.id, paid: true, paidAt: new Date() } });

  // Carlos: nada (inactivo)

  // Lucia: Fútbol Adulto ✅, Natación Infantil ❌ (no coincide categoría - solo como ejemplo de error)
  await prisma.memberFee.create({ data: { memberId: lucia.id, feeId: futbolAdulto.id, paid: true, paidAt: new Date() } });

  // Tomas: Natación Infantil ❌
  await prisma.memberFee.create({ data: { memberId: tomas.id, feeId: natacionInfantil.id, paid: false } });

  console.log("Asignaciones de aranceles deportivos creadas");

  console.log("\nSeed completo: roles, admin, cuotas sociales, socios, aranceles y asignaciones");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
