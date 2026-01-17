import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
    prismaInstance: PrismaClient | undefined;
};

/**
 * Models that have soft delete (deletedAt field)
 * Note: With newer Prisma versions using adapters, middleware isn't available.
 * Soft-delete filtering is handled by a helper function instead.
 */
export const SOFT_DELETE_MODELS = ['Client', 'Policy', 'Claim', 'InsuranceCertificate'] as const;

/**
 * Helper to create a where clause that excludes soft-deleted records
 * Use this when building queries to ensure consistency
 */
export function excludeDeleted<T extends Record<string, unknown>>(where?: T): T & { deletedAt: null } {
    return { ...where, deletedAt: null } as T & { deletedAt: null };
}

function createPrismaClient() {
    // Use file:// URL format as required by the adapter - dev.db is in project root
    const adapter = new PrismaBetterSqlite3({ url: "file:./prisma/dev.db" });
    return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prismaInstance ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaInstance = prisma;
