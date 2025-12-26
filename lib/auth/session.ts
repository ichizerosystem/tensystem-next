import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Role } from '@prisma/client';

const secretKey = process.env.AUTH_SECRET;
if (!secretKey) {
  throw new Error('AUTH_SECRET is not set');
}
const encodedKey = new TextEncoder().encode(secretKey);

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface SessionPayload {
  userId: string;
  role: Role;
  expiresAt: Date;
}

export async function encrypt(payload: Omit<SessionPayload, 'expiresAt'>) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION);
  return new SignJWT({ ...payload, expiresAt })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload as unknown as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function createSession(userId: string, role: Role) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION);
  const session = await encrypt({ userId, role });

  const cookieStore = await cookies();
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function verifySession() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('session')?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    redirect('/login');
  }

  return { isAuth: true, userId: session.userId, role: session.role };
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
