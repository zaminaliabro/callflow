// Small helper for throwing HTTP errors that the error middleware understands.
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message)
    this.status = status
    this.details = details
  }
}

export const notFound = (msg = 'Not found') => new HttpError(404, msg)
export const badRequest = (msg = 'Bad request', details) => new HttpError(400, msg, details)
export const forbidden = (msg = 'Forbidden') => new HttpError(403, msg)
export const unauthorized = (msg = 'Unauthorized') => new HttpError(401, msg)

// Wrap a zod schema parse and convert failures into a 400.
export function parseBody(schema, body) {
  const result = schema.safeParse(body)
  if (!result.success) {
    throw badRequest('Validation failed', result.error.flatten().fieldErrors)
  }
  return result.data
}
