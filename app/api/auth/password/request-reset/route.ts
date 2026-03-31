import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { findUserByEmail, updateUserById } from '@/services/userService'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  const user = await findUserByEmail(email)

  if (user) {
    await updateUserById(user.id, {
      resetToken: randomUUID(),
      resetTokenExpires: new Date(Date.now() + 1000 * 60 * 60),
    })
  }

  return NextResponse.json({ success: true })
}
