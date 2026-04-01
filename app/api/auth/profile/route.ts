import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { updateUserById } from '@/services/userService'

type ProfilePayload = {
  name?: string
  email?: string
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

export async function PATCH(req: NextRequest) {
  const user = await getUserFromRequest()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = (await req.json()) as ProfilePayload

  if (payload.email) {
    if (!payload.currentPassword) {
      return NextResponse.json({ error: 'Current password is required' }, { status: 400 })
    }

    const validCurrentPassword = await bcrypt.compare(payload.currentPassword, user.password)
    if (!validCurrentPassword) {
      return NextResponse.json({ error: 'Current password is invalid' }, { status: 400 })
    }
  }

  let password: string | undefined

  if (payload.newPassword || payload.confirmPassword) {
    if (!payload.currentPassword || !payload.newPassword || !payload.confirmPassword) {
      return NextResponse.json({ error: 'Password change payload is incomplete' }, { status: 400 })
    }

    if (payload.newPassword !== payload.confirmPassword) {
      return NextResponse.json({ error: 'Password confirmation does not match' }, { status: 400 })
    }

    const validCurrentPassword = await bcrypt.compare(payload.currentPassword, user.password)
    if (!validCurrentPassword) {
      return NextResponse.json({ error: 'Current password is invalid' }, { status: 400 })
    }

    password = await bcrypt.hash(payload.newPassword, 10)
  }

  const updatedUser = await updateUserById(user.id, {
    ...(payload.name ? { name: payload.name } : {}),
    ...(payload.email ? { email: payload.email } : {}),
    ...(password ? { password } : {}),
  })

  return NextResponse.json({
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
    },
  })
}
