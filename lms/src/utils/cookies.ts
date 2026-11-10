"use server"
import { cookies } from "next/headers";

export const getAuthToken = async (): Promise<string | null> => {
  try {
    const cookieStore = await cookies();
    return cookieStore.get('auth_token')?.value || null;
  } catch (error) {
    console.error('Error getting auth token from cookies:', error);
    return null;
  }
};


export const setAuthToken = async (token: string): Promise<void> => {
  try {
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 365 * 24 * 60 * 60,
      path: '/',
    });
  } catch (error) {
    console.error('Error setting auth token in cookies:', error);
  }
};


export const removeAuthToken = async (): Promise<void> => {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
  } catch (error) {
    console.error('Error removing auth token from cookies:', error);
  }
};


export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getAuthToken();
  return token !== null;
};