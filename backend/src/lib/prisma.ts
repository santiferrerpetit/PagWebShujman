import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

const url = process.env.NODE_ENV === "production"
  ? "file:/tmp/diez_dev.db"
  : (process.env.DATABASE_URL ?? "file:./dev.db");
const adapter = new PrismaBetterSqlite3({ url });

declare global {
  // eslint-disable-next-line no-var, vars-on-top
  var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma ?? new PrismaClient({ adapter });

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
