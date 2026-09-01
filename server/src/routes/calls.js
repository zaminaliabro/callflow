import { Router } from 'express'
import { logCall, listCalls } from '../controllers/callController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.use(authenticate)

router.get('/', listCalls)
router.post('/', logCall)

export default router
