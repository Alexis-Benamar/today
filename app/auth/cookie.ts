import { createCookie } from '@remix-run/node'

let secret = process.env.COOKIE_SECRET || 'default'
if (secret === 'default') {
  console.warn('⚠️ WARNING: no COOKIE_SECRET environment variable set')
  secret = 'default-secret'
}

export const cookie = createCookie('auth', {
  httpOnly: true,
  maxAge: 604_800,
  sameSite: 'lax',
  secrets: [secret],
  secure: process.env.NODE_ENV === 'production',
})
