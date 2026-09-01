import { Router } from 'express'
import authRoutes from './auth.js'
import agentRoutes from './agents.js'
import customerRoutes from './customers.js'
import callRoutes from './calls.js'
import dashboardRoutes from './dashboard.js'

const router = Router()

router.get('/health', (_req, res) => res.json({ ok: true, service: 'callflow-api' }))
router.use('/auth', authRoutes)
router.use('/agents', agentRoutes)
router.use('/customers', customerRoutes)
router.use('/calls', callRoutes)
router.use('/dashboard', dashboardRoutes)

export default router
