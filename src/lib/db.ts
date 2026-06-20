import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: InstanceType<typeof PrismaClient> };

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  // @ts-expect-error Prisma 7 adapter API
  return new PrismaClient({ adapter });
}

export const db: InstanceType<typeof PrismaClient> =
  globalForPrisma.prisma || (createPrismaClient() as InstanceType<typeof PrismaClient>);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
