import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { registerInputSchema } from "@/modules/auth"
import { createUser } from "@/services/userService"

export async function POST(req: NextRequest) {
  const payload = registerInputSchema.parse(await req.json())
  const password = await bcrypt.hash(payload.password, 10)

  const user = await createUser({
    name: payload.name,
    email: payload.email,
    password,
  })

  return NextResponse.json(
    {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    },
    { status: 201 },
  )
}
