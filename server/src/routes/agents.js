import { Router } from 'express'
import {
  listAgents,
  getAgent,
  createAgent,
  updateAgent,
  deleteAgent,
} from '../controllers/agentController.js'
import { authenticate, requireRole } from '../middleware/auth.js'

const router = Router()

router.use(authenticate, requireRole('ADMIN'))

router.get('/', listAgents)
router.post('/', createAgent)
router.get('/:id', getAgent)
router.put('/:id', updateAgent)
router.delete('/:id', deleteAgent)

export default router
