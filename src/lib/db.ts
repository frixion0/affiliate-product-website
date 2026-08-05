import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // Vercel Postgres auto-injects POSTGRES_PRISMA_URL (pooled, Prisma-compatible)
  // Fall back to DATABASE_URL for other platforms
  const url = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL || ''

  if (!url) {
    console.warn('No database URL found. Set POSTGRES_PRISMA_URL or DATABASE_URL.')
  }

  // Map to DATABASE_URL for Prisma to pick up
  if (!process.env.DATABASE_URL && url) {
    process.env.DATABASE_URL = url
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error'] : [],
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
