import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../prisma.js'
import { signToken } from '../utils/token.js'
import { parseBody, unauthorized } from '../utils/http.js'

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().trim().min(1),
})

function publicUser(user) {
  const { passwordHash, ...safe } = user
  return safe
}

export async function login(req, res) {
  const { email, password } = parseBody(loginSchema, req.body)

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (!user) throw unauthorized('No account found with that email')
  if (!user.isActive) throw unauthorized('This account has been disabled')

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) throw unauthorized('Incorrect password')

  const token = signToken({ sub: user.id, role: user.role })
  res.json({ token, user: publicUser(user) })
}

export async function me(req, res) {
  res.json({ user: req.user })
}

const changePasswordSchema = z.object({
  currentPassword: z.string().trim().min(1),
  newPassword: z.string().trim().min(6),
})

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = parseBody(changePasswordSchema, req.body)
  const user = await prisma.user.findUnique({ where: { id: req.user.id } })
  const ok = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!ok) throw unauthorized('Current password is incorrect')

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(newPassword, 10) },
  })
  res.json({ ok: true })
}
