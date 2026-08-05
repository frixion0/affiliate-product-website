import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // Vercel Postgres injects POSTGRES_URL, but also support DATABASE_URL
  const url = process.env.POSTGRES_URL || process.env.DATABASE_URL || ''

  if (url.startsWith('postgresql://') || url.startsWith('postgres://')) {
    // Neon serverless adapter for Vercel Postgres
    const { neon } = require('@neondatabase/serverless')
    const { PrismaNeon } = require('@prisma/adapter-neon')
    const sql = neon(url)
    const adapter = new PrismaNeon(sql)
    return new PrismaClient({ adapter })
  }

  // Fallback for local dev (standard Prisma connection)
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
