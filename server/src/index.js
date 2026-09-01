import 'dotenv/config'
import 'express-async-errors'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'

import routes from './routes/index.js'
import { errorHandler, notFoundHandler } from './middleware/error.js'
import { prisma } from './prisma.js'

const app = express()
const PORT = process.env.PORT || 5000

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(',') || '*',
    credentials: true,
  }),
)
app.use(express.json())
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'))

app.use('/api', routes)

app.use(notFoundHandler)
app.use(errorHandler)

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
