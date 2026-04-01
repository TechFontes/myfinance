import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const SEEDED_USER_EMAIL = 'daniel@example.com'

async function ensureAccount({
  userId,
  name,
  type,
  initialBalance,
}: {
  userId: string
  name: string
  type: 'BANK' | 'WALLET' | 'OTHER'
  initialBalance: number
}) {
  const existingAccount = await prisma.account.findFirst({
    where: { userId, name },
  })

  if (existingAccount) {
    return existingAccount
  }

  return prisma.account.create({
    data: {
      userId,
      name,
      type,
      initialBalance,
    },
  })
}

async function ensureCategory({
  userId,
  name,
  type,
}: {
  userId: string
  name: string
  type: 'INCOME' | 'EXPENSE'
}) {
  const existingCategory = await prisma.category.findFirst({
    where: { userId, name },
  })

  if (existingCategory) {
    return existingCategory
  }

  return prisma.category.create({
    data: {
      userId,
      name,
      type,
    },
  })
}

async function ensureTransaction({
  userId,
  accountId,
  categoryId,
  type,
  status,
  value,
  competenceDate,
  dueDate,
  paidAt,
  description,
}: {
  userId: string
  accountId: number
  categoryId: number
  type: 'INCOME' | 'EXPENSE'
  status: 'PLANNED' | 'PENDING' | 'PAID' | 'CANCELED'
  value: number
  competenceDate: Date
  dueDate: Date
  paidAt?: Date
  description: string
}) {
  const existingTransaction = await prisma.transaction.findFirst({
    where: {
      userId,
      description,
      competenceDate,
    },
  })

  if (existingTransaction) {
    return existingTransaction
  }

  return prisma.transaction.create({
    data: {
      userId,
      accountId,
      categoryId,
      type,
      status,
      value,
      competenceDate,
      dueDate,
      paidAt,
      description,
    },
  })
}

async function main() {
  console.log('🌱 Seeding...')

  const passwordHash = await bcrypt.hash('123456', 10)

  const user = await prisma.user.upsert({
    where: { email: SEEDED_USER_EMAIL },
    update: {
      name: 'Daniel Teste',
      password: passwordHash,
    },
    create: {
      name: 'Daniel Teste',
      email: SEEDED_USER_EMAIL,
      password: passwordHash,
    },
  })

  console.log('User created:', user.email)

  await ensureAccount({
    userId: user.id,
    name: 'Carteira Física',
    type: 'WALLET',
    initialBalance: 250,
  })
  await ensureAccount({
    userId: user.id,
    name: 'Nubank',
    type: 'BANK',
    initialBalance: 1250.5,
  })
  await ensureAccount({
    userId: user.id,
    name: 'Caixa',
    type: 'BANK',
    initialBalance: 3200,
  })

  await ensureCategory({ userId: user.id, name: 'Salário', type: 'INCOME' })
  await ensureCategory({ userId: user.id, name: 'Alimentação', type: 'EXPENSE' })
  await ensureCategory({ userId: user.id, name: 'Assinaturas', type: 'EXPENSE' })
  await ensureCategory({ userId: user.id, name: 'Transporte', type: 'EXPENSE' })

  const nubank = await prisma.account.findFirst({ where: { userId: user.id, name: 'Nubank' } })
  const carteira = await prisma.account.findFirst({
    where: { userId: user.id, name: 'Carteira Física' },
  })

  const salario = await prisma.category.findFirst({
    where: { userId: user.id, name: 'Salário' },
  })
  const assinaturas = await prisma.category.findFirst({
    where: { userId: user.id, name: 'Assinaturas' },
  })
  const alimentacao = await prisma.category.findFirst({
    where: { userId: user.id, name: 'Alimentação' },
  })

  if (!nubank || !carteira || !salario || !assinaturas || !alimentacao) {
    throw new Error('Seed prerequisites were not created correctly.')
  }

  await ensureTransaction({
    userId: user.id,
    accountId: nubank.id,
    categoryId: salario.id,
    type: 'INCOME',
    status: 'PAID',
    value: 4200,
    competenceDate: new Date('2026-03-05T00:00:00.000Z'),
    dueDate: new Date('2026-03-05T00:00:00.000Z'),
    paidAt: new Date('2026-03-05T00:00:00.000Z'),
    description: 'Salário mensal',
  })
  await ensureTransaction({
    userId: user.id,
    accountId: nubank.id,
    categoryId: assinaturas.id,
    type: 'EXPENSE',
    status: 'PAID',
    value: 55.9,
    competenceDate: new Date('2026-03-06T00:00:00.000Z'),
    dueDate: new Date('2026-03-06T00:00:00.000Z'),
    paidAt: new Date('2026-03-06T00:00:00.000Z'),
    description: 'Spotify',
  })
  await ensureTransaction({
    userId: user.id,
    accountId: carteira.id,
    categoryId: alimentacao.id,
    type: 'EXPENSE',
    status: 'PENDING',
    value: 38.5,
    competenceDate: new Date('2026-03-07T00:00:00.000Z'),
    dueDate: new Date('2026-03-07T00:00:00.000Z'),
    description: 'Lanche',
  })

  console.log('🌱 Seed finalizado com sucesso!')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})
