import { PrismaClient } from '@prisma/client'

// Single PrismaClient for the process (avoids exhausting the connection pool
// under nodemon reloads).
const globalForPrisma = globalThis

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
