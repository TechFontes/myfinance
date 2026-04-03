import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { signAuthToken } from "@/lib/auth"
import { registerInputSchema } from "@/modules/auth"
import { createUser } from "@/services/userService"

const TOKEN_COOKIE_NAME = "auth_token"

export async function POST(req: NextRequest) {
  const payload = registerInputSchema.parse(await req.json())
  const password = await bcrypt.hash(payload.password, 10)

  const user = await createUser({
    name: payload.name,
    email: payload.email,
    password,
  })

  const token = signAuthToken({ sub: user.id, email: user.email, role: user.role, tokenVersion: user.tokenVersion ?? 0 })

  const res = NextResponse.json(
    {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
    { status: 201 },
  )

  res.cookies.set(TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })

  return res
}
