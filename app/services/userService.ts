import { prisma } from '@/lib/prisma'
type UserRecord = {
  id: string
  name: string | null
  email: string
  password: string
  resetToken: string | null
  resetTokenExpiry: Date | null
  role: 'USER' | 'ADMIN'
  blockedAt: Date | null
  blockedReason: string | null
  createdAt: Date
  updatedAt: Date
}

type UserCreateInput = {
  name?: string | null
  email: string
  password: string
  resetToken?: string | null
  resetTokenExpiry?: Date | null
  role?: 'USER' | 'ADMIN'
  blockedAt?: Date | null
  blockedReason?: string | null
}

type UserUpdateInput = Partial<UserCreateInput>

function mapUserRecord(user: {
  id: string
  name: string | null
  email: string
  password: string
  resetToken: string | null
  resetTokenExpires: Date | null
  role: 'USER' | 'ADMIN'
  blockedAt: Date | null
  blockedReason: string | null
  createdAt: Date
  updatedAt: Date
}): UserRecord {
  return {
    ...user,
    resetTokenExpiry: user.resetTokenExpires,
  }
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  return user ? mapUserRecord(user) : null
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  const user = await prisma.user.findUnique({
    where: { id },
  })

  return user ? mapUserRecord(user) : null
}

export async function findUserByResetToken(token: string): Promise<UserRecord | null> {
  const user = await prisma.user.findFirst({
    where: { resetToken: token },
  })

  return user ? mapUserRecord(user) : null
}

export async function createUser(data: UserCreateInput): Promise<UserRecord> {
  const user = await prisma.user.create({
    data: {
      ...data,
      resetTokenExpires: data.resetTokenExpiry,
    },
  })

  return mapUserRecord(user)
}

export async function updateUserById(
  id: string,
  data: UserUpdateInput,
): Promise<UserRecord> {
  const user = await prisma.user.update({
    where: { id },
    data: {
      ...data,
      resetTokenExpires: data.resetTokenExpiry,
    },
  })

  return mapUserRecord(user)
}
