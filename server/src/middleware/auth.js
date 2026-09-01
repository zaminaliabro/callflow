import { prisma } from '../prisma.js'
import { verifyToken } from '../utils/token.js'
import { unauthorized, forbidden } from '../utils/http.js'

// Verifies the Bearer token and attaches req.user (without passwordHash).
export async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) throw unauthorized('Missing auth token')

    let payload
    try {
      payload = verifyToken(token)
    } catch {
      throw unauthorized('Invalid or expired token')
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user || !user.isActive) throw unauthorized('Account not found or disabled')

    const { passwordHash, ...safe } = user
    req.user = safe
    next()
  } catch (err) {
    next(err)
  }
}

// Route guard: requireRole('ADMIN')
export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(unauthorized())
    if (!roles.includes(req.user.role)) return next(forbidden('Insufficient permissions'))
    next()
  }
}
