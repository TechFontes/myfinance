import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { listAccountsByUser } from "@/services/accountService";

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = await listAccountsByUser(user.id);

  return NextResponse.json(accounts);
}
