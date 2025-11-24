import { prisma } from "@/lib/prisma";

export async function listAccountsByUser(userId: string) {
  return prisma.account.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}
