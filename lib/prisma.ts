import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const connectionString =
  process.env.POSTGRES_URL ?? process.env.PRISMA_DATABASE_URL;

if (!connectionString) {
  throw new Error("POSTGRES_URL or PRISMA_DATABASE_URL must be set.");
}

const adapter = new PrismaPg(connectionString);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
