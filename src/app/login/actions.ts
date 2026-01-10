"use server";
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { redirect } from 'next/navigation';

export async function logout() {
    if (auth) {
        await signOut(auth);
    }
    // Even if auth fails, redirect
    redirect('/');
}
