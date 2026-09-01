import { Router } from 'express'
import {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  assignCustomer,
  deleteCustomer,
} from '../controllers/customerController.js'
import { authenticate, requireRole } from '../middleware/auth.js'

const router = Router()

router.use(authenticate)

router.get('/', listCustomers)
router.post('/', createCustomer) // admin or agent (agent -> assigned to self)
router.get('/:id', getCustomer)
router.put('/:id', updateCustomer) // admin any; agent own
router.put('/:id/assign', requireRole('ADMIN'), assignCustomer)
router.delete('/:id', requireRole('ADMIN'), deleteCustomer)

export default router
