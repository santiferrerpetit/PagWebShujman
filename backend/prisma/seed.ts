import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const url = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url });
const prisma = new PrismaClient({ adapter });

async function main() {
  const existingRoles = await prisma.role.count();
  if (existingRoles === 0) {
    await prisma.role.create({ data: { name: "Administrator" } });
    await prisma.role.create({ data: { name: "Professor" } });
    await prisma.role.create({ data: { name: "Maintenance" } });
    console.log("Roles created");
  } else {
    console.log("Roles already exist, skipping");
  }

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

  const existingMembers = await prisma.member.count();
  if (existingMembers > 0) {
    console.log("Members already exist, skipping");
    return;
  }

  const juan = await prisma.member.create({
    data: {
      firstName: "Juan",
      lastName: "Perez",
      dni: "12345678",
      birthDate: new Date("1990-05-15"),
      contact: "juan@example.com",
      socialFeePaid: true,
    },
  });

  const maria = await prisma.member.create({
    data: {
      firstName: "Maria",
      lastName: "Garcia",
      dni: "23456789",
      birthDate: new Date("1992-08-22"),
      contact: "maria@example.com",
      socialFeePaid: true,
    },
  });

  const carlos = await prisma.member.create({
    data: {
      firstName: "Carlos",
      lastName: "Lopez",
      dni: "34567890",
      birthDate: new Date("1988-11-30"),
      contact: "carlos@example.com",
      socialFeePaid: false,
    },
  });

  const lucia = await prisma.member.create({
    data: {
      firstName: "Lucia",
      lastName: "Martinez",
      dni: "45678901",
      birthDate: new Date("1995-02-10"),
      contact: "lucia@example.com",
      socialFeePaid: true,
    },
  });

  console.log("4 socios created");

  const futbol = await prisma.sportsFee.create({
    data: { name: "Cuota Fútbol", amount: 1500, description: "Arancel mensual de Fútbol" },
  });
  const basquet = await prisma.sportsFee.create({
    data: { name: "Cuota Básquet", amount: 1200, description: "Arancel mensual de Básquet" },
  });
  const voley = await prisma.sportsFee.create({
    data: { name: "Cuota Vóley", amount: 1000, description: "Arancel mensual de Vóley" },
  });
  const natacion = await prisma.sportsFee.create({
    data: { name: "Cuota Natación", amount: 1800, description: "Arancel mensual de Natación" },
  });

  console.log("4 aranceles created");

  // Juan Perez: Fútbol ✅, Básquet ❌
  await prisma.memberFee.create({
    data: { memberId: juan.id, feeId: futbol.id, paid: true, paidAt: new Date() },
  });
  await prisma.memberFee.create({
    data: { memberId: juan.id, feeId: basquet.id, paid: false },
  });

  // Maria Garcia: Fútbol ✅, Vóley ✅
  await prisma.memberFee.create({
    data: { memberId: maria.id, feeId: futbol.id, paid: true, paidAt: new Date() },
  });
  await prisma.memberFee.create({
    data: { memberId: maria.id, feeId: voley.id, paid: true, paidAt: new Date() },
  });

  // Carlos Lopez: Natación ❌ ($1800)
  await prisma.memberFee.create({
    data: { memberId: carlos.id, feeId: natacion.id, paid: false },
  });

  // Lucia Martinez: Básquet ✅, Natación ✅
  await prisma.memberFee.create({
    data: { memberId: lucia.id, feeId: basquet.id, paid: true, paidAt: new Date() },
  });
  await prisma.memberFee.create({
    data: { memberId: lucia.id, feeId: natacion.id, paid: true, paidAt: new Date() },
  });

  console.log("7 asignaciones created");

  // Calculate accumulatedDebt for each member
  const members = [juan, maria, carlos, lucia];
  for (const member of members) {
    const pendingFees = await prisma.memberFee.findMany({
      where: { memberId: member.id, paid: false },
      include: { fee: true },
    });
    const totalDebt = pendingFees.reduce((sum, mf) => sum + Number(mf.fee.amount), 0);
    await prisma.member.update({
      where: { id: member.id },
      data: { accumulatedDebt: totalDebt },
    });
    console.log(`${member.firstName} ${member.lastName}: deuda acumulada = $${totalDebt}`);
  }

  console.log("\nSeed completo: roles, admin, socios, aranceles y asignaciones");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
