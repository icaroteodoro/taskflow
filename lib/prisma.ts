import { PrismaClient } from './generated/prisma/client';
import { createClient } from '@libsql/client'
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const libsql = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
})

const adapter = new PrismaBetterSqlite3(libsql)

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
