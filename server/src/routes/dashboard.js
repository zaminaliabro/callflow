import { Router } from 'express'
import { adminDashboard, agentDashboard } from '../controllers/dashboardController.js'
import { authenticate, requireRole } from '../middleware/auth.js'

const router = Router()

router.use(authenticate)

router.get('/admin', requireRole('ADMIN'), adminDashboard)
router.get('/agent', agentDashboard)

export default router
