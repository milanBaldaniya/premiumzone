import { z } from 'zod';

const email = z.string().email('Invalid email address').toLowerCase().trim();
const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(64)
  .regex(/[a-z]/, 'Must contain a lowercase letter')
  .regex(/[A-Z]/, 'Must contain an uppercase letter')
  .regex(/[0-9]/, 'Must contain a number');

export const registerSchema = z.object({
  name: z.string().min(2, 'Name is too short').max(80).trim(),
  email,
  password,
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

export const googleAuthSchema = z.object({
  idToken: z.string().min(1, 'Google idToken is required'),
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: password,
});

export const verifyEmailSchema = z.object({ token: z.string().min(1) });
