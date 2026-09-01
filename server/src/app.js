import 'express-async-errors'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'

import routes from './routes/index.js'
import { errorHandler, notFoundHandler } from './middleware/error.js'

// Builds the Express app WITHOUT starting a listener or opening a DB connection,
// so it can be used both by the local dev server (src/index.js) and by the
// Vercel serverless entry (api/index.js).
const app = express()

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(',') || true,
    credentials: true,
  }),
)
app.use(express.json())

// Request logging only in local dev (noisy + pointless in serverless logs).
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.use(morgan('dev'))
}

app.use('/api', routes)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
