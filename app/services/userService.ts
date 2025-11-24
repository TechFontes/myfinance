// services/userService.ts
import { prisma } from '@/lib/prisma'
import type { User } from '@prisma/client'

export async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email },
  })
}

export async function findUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id },
  })
}
