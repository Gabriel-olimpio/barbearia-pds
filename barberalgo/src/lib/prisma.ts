import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Puxa a URL do seu .env.local (seguro para o GitHub)
const connectionString = process.env.DATABASE_URL || "";

// Cria o adaptador obrigatório da versão 7
const adapter = new PrismaPg({ connectionString });

// Instancia o Prisma com o adaptador (isso resolve o erro de "non-empty")
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;