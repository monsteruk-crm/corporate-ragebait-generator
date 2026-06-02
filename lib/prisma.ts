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

function normalizeConnectionString(value: string): string {
  const url = new URL(value);
  const sslmode = url.searchParams.get("sslmode");

  if (sslmode === "prefer" || sslmode === "require" || sslmode === "verify-ca") {
    url.searchParams.set("uselibpqcompat", "true");
  }

  return url.toString();
}

const adapter = new PrismaPg(normalizeConnectionString(connectionString));

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
