import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { findUserByResetToken, updateUserById } from '@/services/userService'

export async function POST(req: NextRequest) {
  const { token, password, confirmPassword } = await req.json()

  if (!token || !password || !confirmPassword || password !== confirmPassword) {
    return NextResponse.json({ error: 'Invalid reset payload' }, { status: 400 })
  }

  if (typeof password !== 'string' || password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  const user = await findUserByResetToken(token)
  if (!user || !user.resetTokenExpiry || user.resetTokenExpiry.getTime() < Date.now()) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await updateUserById(user.id, {
    password: hashedPassword,
    resetToken: null,
    resetTokenExpiry: null,
  })

  return NextResponse.json({ success: true })
}
