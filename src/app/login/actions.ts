"use server";

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

export async function login(formData: FormData) {
  const password = formData.get('password');

  if (password === process.env.ADMIN_PASSWORD) {
    const session = { user: 'admin', loggedInAt: Date.now() };
    const encryptedSession = JSON.stringify(session); // In a real app, use JWT or a library like Iron Session

    cookies().set('session', encryptedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires,
      path: '/',
      sameSite: 'lax',
    });
    
    redirect('/admin');
  }

  return { error: 'Invalid access key. Access denied.' };
}

export async function logout() {
    cookies().set('session', '', { expires: new Date(0) });
    redirect('/login');
}
