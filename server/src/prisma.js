import { PrismaClient } from '@prisma/client'

// One PrismaClient per process, reused across serverless warm invocations and
// across nodemon reloads in dev.
const globalForPrisma = globalThis

export const prisma =
  globalForPrisma.__callflowPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

globalForPrisma.__callflowPrisma = prisma
