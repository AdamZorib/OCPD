import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
    prismaInstance: PrismaClient | undefined;
};

function createPrismaClient() {
    // Use file:// URL format as required by the adapter - dev.db is in project root
    const adapter = new PrismaBetterSqlite3({ url: "file:./prisma/dev.db" });
    return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prismaInstance ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaInstance = prisma;

