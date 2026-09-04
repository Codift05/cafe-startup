import { defineEventHandler, createError, getRequestHeader } from 'h3'

/**
 * In-Memory Sliding Window Rate Limiter for Server Middleware
 * Protects public and sensitive API endpoints against brute-force and DDoS attempts.
 */

interface RateLimitRecord {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitRecord>()

// Configuration limits per path prefix
const LIMITS: Record<string, { max: number; windowMs: number }> = {
  '/api/orders': { max: 10, windowMs: 60 * 1000 },      // Max 10 order attempts per min
  '/api/payments': { max: 15, windowMs: 60 * 1000 },    // Max 15 payment status/init per min
  '/api/tables/verify': { max: 20, windowMs: 60 * 1000 },// Max 20 QR table verify per min
  '/api/staff': { max: 60, windowMs: 60 * 1000 },       // Max 60 staff requests per min
}

export default defineEventHandler((event) => {
  const path = event.path || ''

  // Only rate limit /api endpoints
  if (!path.startsWith('/api/')) return

  // Find matching path limit rule
  const matchedRuleKey = Object.keys(LIMITS).find((prefix) => path.startsWith(prefix))
  if (!matchedRuleKey) return

  const rule = LIMITS[matchedRuleKey]
  if (!rule) return

  // Extract client IP address
  const clientIp = 
    getRequestHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim() ||
    getRequestHeader(event, 'x-real-ip') ||
    '127.0.0.1'

  const clientKey = `${clientIp}:${matchedRuleKey}`
  const now = Date.now()

  const currentRecord = rateLimitMap.get(clientKey)

  if (!currentRecord || now > currentRecord.resetTime) {
    // Initialize or reset window
    rateLimitMap.set(clientKey, {
      count: 1,
      resetTime: now + rule.windowMs,
    })
    return
  }

  // Increment counter
  currentRecord.count += 1

  if (currentRecord.count > rule.max) {
    const retryAfter = Math.ceil((currentRecord.resetTime - now) / 1000)
    event.node.res.setHeader('Retry-After', retryAfter.toString())
    
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      message: `Batas percobaan tercapai. Silakan coba lagi dalam ${retryAfter} detik.`,
    })
  }
})
