'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth/password';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export async function login(prevState: any, formData: FormData) {
  const result = loginSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { email, password } = result.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.passwordHash) {
    // Log failure (Email not found or no hash)
    await prisma.auditLog.create({
      data: {
        tableName: 'User',
        recordId: 'Unknown',
        action: 'LOGIN_FAILURE',
        userId: null,
        details: { email, reason: 'User not found or no password hash' },
      },
    });
    return {
      message: 'Invalid email or password',
    };
  }

  const isPasswordValid = await verifyPassword(password, user.passwordHash);

  if (!isPasswordValid) {
    // Log failure (Invalid password)
    await prisma.auditLog.create({
      data: {
        tableName: 'User',
        recordId: user.id,
        action: 'LOGIN_FAILURE',
        userId: user.id,
        details: { email, reason: 'Invalid password' },
      },
    });
    return {
      message: 'Invalid email or password',
    };
  }

  // Create session
  await createSession(user.id, user.role);

  // Log success
  await prisma.auditLog.create({
    data: {
      tableName: 'User',
      recordId: user.id,
      action: 'LOGIN_SUCCESS',
      userId: user.id,
      details: { email },
    },
  });

  // Redirect
  redirect('/admin');
}

export async function logout() {
  const { deleteSession } = await import('@/lib/auth/session');
  await deleteSession();
  redirect('/login');
}
