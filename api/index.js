// Vercel serverless entry point.
// All /api/* requests are rewritten here (see vercel.json) and handled by the
// same Express app used in local development.
import app from '../server/src/app.js'

export default app
