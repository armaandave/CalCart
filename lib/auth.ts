import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-this'
)

export interface AuthJWTPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createToken(payload: Omit<AuthJWTPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY)
}

export async function verifyToken(token: string): Promise<AuthJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY)
    // Narrow unknown JWTPayload from `jose` to our app-specific shape
    if (
      payload &&
      typeof payload === 'object' &&
      typeof (payload as Record<string, unknown>).userId === 'string' &&
      typeof (payload as Record<string, unknown>).email === 'string'
    ) {
      const typedPayload = payload as unknown as AuthJWTPayload
      return typedPayload
    }
    return null
  } catch (error) {
    return null
  }
}

export async function getSession(): Promise<AuthJWTPayload | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('auth-token')
  
  if (!token) return null
  
  return verifyToken(token.value)
}

export async function setAuthCookie(token: string) {
  const cookieStore = cookies()
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  })
}

export async function clearAuthCookie() {
  const cookieStore = cookies()
  cookieStore.delete('auth-token')
}

