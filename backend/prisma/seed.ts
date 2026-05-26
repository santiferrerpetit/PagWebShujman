import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const url = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url });
const prisma = new PrismaClient({ adapter });

async function main() {
  const existingRoles = await prisma.role.count();
  if (existingRoles > 0) {
    console.log("Roles already exist, skipping seed");
    return;
  }

  const adminRole = await prisma.role.create({ data: { name: "Administrator" } });
  await prisma.role.create({ data: { name: "Professor" } });
  await prisma.role.create({ data: { name: "Maintenance" } });

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.create({
    data: {
      username: "admin",
      email: "admin@club.com",
      firstName: "Admin",
      lastName: "Principal",
      password: hashedPassword,
      roleId: adminRole.id,
    },
  });

  console.log("Seed complete: 3 roles + admin user created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
