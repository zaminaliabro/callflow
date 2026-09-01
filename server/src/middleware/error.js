import { Prisma } from '@prisma/client'

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  // Known Prisma errors -> friendly messages
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: `A record with that ${err.meta?.target?.join(', ') || 'value'} already exists`,
      })
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Record not found' })
    }
  }

  const status = err.status || 500
  if (status === 500) console.error(err)

  res.status(status).json({
    error: err.message || 'Internal server error',
    ...(err.details ? { details: err.details } : {}),
  })
}

export function notFoundHandler(_req, res) {
  res.status(404).json({ error: 'Route not found' })
}
