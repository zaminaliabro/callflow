// Vercel serverless entry point.
// All /api/* requests are rewritten here (see vercel.json) and handled by the
// same Express app used in local development.
//
// On Vercel, env vars come from the project settings (this dotenv call is a
// harmless no-op there). Locally (`vercel dev`) it loads a root-level .env.
import 'dotenv/config'
import app from '../server/src/app.js'

export default app
