import { LoginProvider, UserRole } from '@/lib/enums';
import { z } from 'zod';

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  salt: z.string(),
  role: z.nativeEnum(UserRole),
  loginProvider: z.nativeEnum(LoginProvider),
  hasNotifications: z.boolean(),
  isEmailVerified: z.boolean(),
  lastLoginAt: z.date().optional(),
  lastActiveAt: z.date().optional(),
  deletedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserSchema = z.infer<typeof userSchema>;
