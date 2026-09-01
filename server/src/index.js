import 'dotenv/config'
import app from './app.js'
import { prisma } from './prisma.js'

// Local development entry point. On Vercel the app is served from api/index.js
// as a serverless function and this file is never executed.
const PORT = process.env.PORT || 5000

async function start() {
  try {
    await prisma.$connect()
    console.log('✔ Connected to PostgreSQL')
  } catch (err) {
    console.error('[x] Could not connect to the database.')
    console.error('  Check DATABASE_URL in server/.env and that Postgres is reachable.')
    console.error('  ', err.message)
    process.exit(1)
  }

  app.listen(PORT, () => {
    console.log(`✔ CallFlow API listening on http://localhost:${PORT}`)
  })
}

start()

const shutdown = async () => {
  await prisma.$disconnect()
  process.exit(0)
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
