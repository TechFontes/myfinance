import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const SEEDED_USER_EMAIL = 'daniel@example.com'

// ---------------------------------------------------------------------------
// Idempotent helpers
// ---------------------------------------------------------------------------

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
  parentId,
}: {
  userId: string
  name: string
  type: 'INCOME' | 'EXPENSE'
  parentId?: number
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
      parentId,
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
  creditCardId,
  invoiceId,
}: {
  userId: string
  accountId?: number
  categoryId: number
  type: 'INCOME' | 'EXPENSE'
  status: 'PLANNED' | 'PENDING' | 'PAID' | 'CANCELED'
  value: number
  competenceDate: Date
  dueDate: Date
  paidAt?: Date
  description: string
  creditCardId?: number
  invoiceId?: number
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
      creditCardId,
      invoiceId,
    },
  })
}

async function ensureCreditCard({
  userId,
  name,
  limit,
  closeDay,
  dueDay,
}: {
  userId: string
  name: string
  limit: number
  closeDay: number
  dueDay: number
}) {
  const existing = await prisma.creditCard.findFirst({
    where: { userId, name },
  })

  if (existing) {
    return existing
  }

  return prisma.creditCard.create({
    data: { userId, name, limit, closeDay, dueDay },
  })
}

async function ensureInvoice({
  creditCardId,
  month,
  year,
  status,
  total,
  dueDate,
}: {
  creditCardId: number
  month: number
  year: number
  status: 'OPEN' | 'PAID' | 'CANCELED'
  total: number
  dueDate: Date
}) {
  const existing = await prisma.invoice.findFirst({
    where: { creditCardId, month, year },
  })

  if (existing) {
    return existing
  }

  return prisma.invoice.create({
    data: { creditCardId, month, year, status, total, dueDate },
  })
}

async function ensureTransfer({
  userId,
  sourceAccountId,
  destinationAccountId,
  amount,
  description,
  competenceDate,
  dueDate,
  paidAt,
  status,
}: {
  userId: string
  sourceAccountId: number
  destinationAccountId: number
  amount: number
  description: string
  competenceDate: Date
  dueDate: Date
  paidAt?: Date
  status: 'PLANNED' | 'PENDING' | 'PAID' | 'CANCELED'
}) {
  const existing = await prisma.transfer.findFirst({
    where: { userId, description, competenceDate },
  })

  if (existing) {
    return existing
  }

  return prisma.transfer.create({
    data: {
      userId,
      sourceAccountId,
      destinationAccountId,
      amount,
      description,
      competenceDate,
      dueDate,
      paidAt,
      status,
    },
  })
}

async function ensureGoal({
  userId,
  name,
  targetAmount,
  reserveAccountId,
}: {
  userId: string
  name: string
  targetAmount: number
  reserveAccountId?: number
}) {
  const existing = await prisma.goal.findFirst({
    where: { userId, name },
  })

  if (existing) {
    return existing
  }

  return prisma.goal.create({
    data: { userId, name, targetAmount, reserveAccountId },
  })
}

async function ensureGoalContribution({
  goalId,
  amount,
  kind,
  transferId,
}: {
  goalId: number
  amount: number
  kind: 'CONTRIBUTION' | 'WITHDRAWAL' | 'ADJUSTMENT'
  transferId?: number
}) {
  const existing = await prisma.goalContribution.findFirst({
    where: { goalId, amount, kind },
  })

  if (existing) {
    return existing
  }

  return prisma.goalContribution.create({
    data: { goalId, amount, kind, transferId },
  })
}

async function ensureRecurringRule({
  userId,
  type,
  description,
  value,
  categoryId,
  accountId,
  creditCardId,
  frequency,
  dayOfMonth,
  startDate,
}: {
  userId: string
  type: 'INCOME' | 'EXPENSE'
  description: string
  value: number
  categoryId: number
  accountId?: number
  creditCardId?: number
  frequency: string
  dayOfMonth?: number
  startDate: Date
}) {
  const existing = await prisma.recurringRule.findFirst({
    where: { userId, description },
  })

  if (existing) {
    return existing
  }

  return prisma.recurringRule.create({
    data: {
      userId,
      type,
      description,
      value,
      categoryId,
      accountId,
      creditCardId,
      frequency,
      dayOfMonth,
      startDate,
    },
  })
}

// ---------------------------------------------------------------------------
// Main seed
// ---------------------------------------------------------------------------

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

  // -----------------------------------------------------------------------
  // Accounts
  // -----------------------------------------------------------------------
  const nubank = await ensureAccount({
    userId: user.id,
    name: 'Nubank',
    type: 'BANK',
    initialBalance: 1250.5,
  })
  const carteira = await ensureAccount({
    userId: user.id,
    name: 'Carteira Física',
    type: 'WALLET',
    initialBalance: 250,
  })
  const caixa = await ensureAccount({
    userId: user.id,
    name: 'Caixa',
    type: 'BANK',
    initialBalance: 3200,
  })

  // -----------------------------------------------------------------------
  // Categories – Income
  // -----------------------------------------------------------------------
  const salario = await ensureCategory({ userId: user.id, name: 'Salário', type: 'INCOME' })
  const freelance = await ensureCategory({ userId: user.id, name: 'Freelance', type: 'INCOME' })
  const investimentos = await ensureCategory({ userId: user.id, name: 'Investimentos', type: 'INCOME' })

  // -----------------------------------------------------------------------
  // Categories – Expense (nested with parentId)
  // -----------------------------------------------------------------------
  const moradia = await ensureCategory({ userId: user.id, name: 'Moradia', type: 'EXPENSE' })
  const aluguel = await ensureCategory({ userId: user.id, name: 'Aluguel', type: 'EXPENSE', parentId: moradia.id })
  const condominio = await ensureCategory({ userId: user.id, name: 'Condomínio', type: 'EXPENSE', parentId: moradia.id })

  const alimentacao = await ensureCategory({ userId: user.id, name: 'Alimentação', type: 'EXPENSE' })
  const restaurantes = await ensureCategory({ userId: user.id, name: 'Restaurantes', type: 'EXPENSE', parentId: alimentacao.id })
  const supermercado = await ensureCategory({ userId: user.id, name: 'Supermercado', type: 'EXPENSE', parentId: alimentacao.id })

  const transporte = await ensureCategory({ userId: user.id, name: 'Transporte', type: 'EXPENSE' })
  const assinaturas = await ensureCategory({ userId: user.id, name: 'Assinaturas', type: 'EXPENSE' })
  const lazer = await ensureCategory({ userId: user.id, name: 'Lazer', type: 'EXPENSE' })
  const saude = await ensureCategory({ userId: user.id, name: 'Saúde', type: 'EXPENSE' })

  // -----------------------------------------------------------------------
  // Credit Card
  // -----------------------------------------------------------------------
  const nubankCard = await ensureCreditCard({
    userId: user.id,
    name: 'Nubank Platinum',
    limit: 5000,
    closeDay: 20,
    dueDay: 10,
  })

  // -----------------------------------------------------------------------
  // Invoices (February PAID, April OPEN)
  // -----------------------------------------------------------------------
  const invoiceFeb = await ensureInvoice({
    creditCardId: nubankCard.id,
    month: 2,
    year: 2026,
    status: 'PAID',
    total: 620.5,
    dueDate: new Date('2026-03-10T00:00:00.000Z'),
  })

  const invoiceApr = await ensureInvoice({
    creditCardId: nubankCard.id,
    month: 4,
    year: 2026,
    status: 'OPEN',
    total: 890.0,
    dueDate: new Date('2026-05-10T00:00:00.000Z'),
  })

  // -----------------------------------------------------------------------
  // Credit card transactions – February invoice
  // -----------------------------------------------------------------------
  await ensureTransaction({
    userId: user.id,
    creditCardId: nubankCard.id,
    invoiceId: invoiceFeb.id,
    categoryId: restaurantes.id,
    type: 'EXPENSE',
    status: 'PAID',
    value: 245.5,
    competenceDate: new Date('2026-02-05T00:00:00.000Z'),
    dueDate: new Date('2026-03-10T00:00:00.000Z'),
    paidAt: new Date('2026-03-10T00:00:00.000Z'),
    description: 'Jantar restaurante italiano',
  })
  await ensureTransaction({
    userId: user.id,
    creditCardId: nubankCard.id,
    invoiceId: invoiceFeb.id,
    categoryId: lazer.id,
    type: 'EXPENSE',
    status: 'PAID',
    value: 375.0,
    competenceDate: new Date('2026-02-15T00:00:00.000Z'),
    dueDate: new Date('2026-03-10T00:00:00.000Z'),
    paidAt: new Date('2026-03-10T00:00:00.000Z'),
    description: 'Ingressos show',
  })

  // -----------------------------------------------------------------------
  // Credit card transactions – April invoice
  // -----------------------------------------------------------------------
  await ensureTransaction({
    userId: user.id,
    creditCardId: nubankCard.id,
    invoiceId: invoiceApr.id,
    categoryId: supermercado.id,
    type: 'EXPENSE',
    status: 'PENDING',
    value: 520.0,
    competenceDate: new Date('2026-04-03T00:00:00.000Z'),
    dueDate: new Date('2026-05-10T00:00:00.000Z'),
    description: 'Compras do mês supermercado',
  })
  await ensureTransaction({
    userId: user.id,
    creditCardId: nubankCard.id,
    invoiceId: invoiceApr.id,
    categoryId: saude.id,
    type: 'EXPENSE',
    status: 'PENDING',
    value: 370.0,
    competenceDate: new Date('2026-04-10T00:00:00.000Z'),
    dueDate: new Date('2026-05-10T00:00:00.000Z'),
    description: 'Farmácia mensal',
  })

  // -----------------------------------------------------------------------
  // Six months of transactions (Jan–Jun 2026)
  // -----------------------------------------------------------------------

  // -- January 2026 --
  await ensureTransaction({
    userId: user.id,
    accountId: nubank.id,
    categoryId: salario.id,
    type: 'INCOME',
    status: 'PAID',
    value: 4200,
    competenceDate: new Date('2026-01-05T00:00:00.000Z'),
    dueDate: new Date('2026-01-05T00:00:00.000Z'),
    paidAt: new Date('2026-01-05T00:00:00.000Z'),
    description: 'Salário mensal janeiro',
  })
  await ensureTransaction({
    userId: user.id,
    accountId: nubank.id,
    categoryId: aluguel.id,
    type: 'EXPENSE',
    status: 'PAID',
    value: 1500,
    competenceDate: new Date('2026-01-10T00:00:00.000Z'),
    dueDate: new Date('2026-01-10T00:00:00.000Z'),
    paidAt: new Date('2026-01-10T00:00:00.000Z'),
    description: 'Aluguel janeiro',
  })
  await ensureTransaction({
    userId: user.id,
    accountId: carteira.id,
    categoryId: transporte.id,
    type: 'EXPENSE',
    status: 'PAID',
    value: 120,
    competenceDate: new Date('2026-01-15T00:00:00.000Z'),
    dueDate: new Date('2026-01-15T00:00:00.000Z'),
    paidAt: new Date('2026-01-15T00:00:00.000Z'),
    description: 'Uber janeiro',
  })

  // -- February 2026 --
  await ensureTransaction({
    userId: user.id,
    accountId: nubank.id,
    categoryId: salario.id,
    type: 'INCOME',
    status: 'PAID',
    value: 4200,
    competenceDate: new Date('2026-02-05T00:00:00.000Z'),
    dueDate: new Date('2026-02-05T00:00:00.000Z'),
    paidAt: new Date('2026-02-05T00:00:00.000Z'),
    description: 'Salário mensal fevereiro',
  })
  await ensureTransaction({
    userId: user.id,
    accountId: nubank.id,
    categoryId: aluguel.id,
    type: 'EXPENSE',
    status: 'PAID',
    value: 1500,
    competenceDate: new Date('2026-02-10T00:00:00.000Z'),
    dueDate: new Date('2026-02-10T00:00:00.000Z'),
    paidAt: new Date('2026-02-10T00:00:00.000Z'),
    description: 'Aluguel fevereiro',
  })
  await ensureTransaction({
    userId: user.id,
    accountId: nubank.id,
    categoryId: condominio.id,
    type: 'EXPENSE',
    status: 'PAID',
    value: 450,
    competenceDate: new Date('2026-02-10T00:00:00.000Z'),
    dueDate: new Date('2026-02-10T00:00:00.000Z'),
    paidAt: new Date('2026-02-10T00:00:00.000Z'),
    description: 'Condomínio fevereiro',
  })
  await ensureTransaction({
    userId: user.id,
    accountId: nubank.id,
    categoryId: freelance.id,
    type: 'INCOME',
    status: 'PAID',
    value: 800,
    competenceDate: new Date('2026-02-20T00:00:00.000Z'),
    dueDate: new Date('2026-02-20T00:00:00.000Z'),
    paidAt: new Date('2026-02-20T00:00:00.000Z'),
    description: 'Projeto freelance site',
  })

  // -- March 2026 --
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
    description: 'Salário mensal março',
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
    description: 'Spotify março',
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
    description: 'Lanche padaria',
  })
  await ensureTransaction({
    userId: user.id,
    accountId: nubank.id,
    categoryId: saude.id,
    type: 'EXPENSE',
    status: 'CANCELED',
    value: 200,
    competenceDate: new Date('2026-03-15T00:00:00.000Z'),
    dueDate: new Date('2026-03-15T00:00:00.000Z'),
    description: 'Consulta médica cancelada',
  })

  // -- April 2026 --
  await ensureTransaction({
    userId: user.id,
    accountId: nubank.id,
    categoryId: salario.id,
    type: 'INCOME',
    status: 'PLANNED',
    value: 4200,
    competenceDate: new Date('2026-04-05T00:00:00.000Z'),
    dueDate: new Date('2026-04-05T00:00:00.000Z'),
    description: 'Salário mensal abril',
  })
  await ensureTransaction({
    userId: user.id,
    accountId: nubank.id,
    categoryId: aluguel.id,
    type: 'EXPENSE',
    status: 'PENDING',
    value: 1500,
    competenceDate: new Date('2026-04-10T00:00:00.000Z'),
    dueDate: new Date('2026-04-10T00:00:00.000Z'),
    description: 'Aluguel abril',
  })
  await ensureTransaction({
    userId: user.id,
    accountId: carteira.id,
    categoryId: transporte.id,
    type: 'EXPENSE',
    status: 'PLANNED',
    value: 150,
    competenceDate: new Date('2026-04-15T00:00:00.000Z'),
    dueDate: new Date('2026-04-15T00:00:00.000Z'),
    description: 'Combustível abril',
  })

  // -- May 2026 --
  await ensureTransaction({
    userId: user.id,
    accountId: nubank.id,
    categoryId: salario.id,
    type: 'INCOME',
    status: 'PLANNED',
    value: 4200,
    competenceDate: new Date('2026-05-05T00:00:00.000Z'),
    dueDate: new Date('2026-05-05T00:00:00.000Z'),
    description: 'Salário mensal maio',
  })
  await ensureTransaction({
    userId: user.id,
    accountId: nubank.id,
    categoryId: aluguel.id,
    type: 'EXPENSE',
    status: 'PLANNED',
    value: 1500,
    competenceDate: new Date('2026-05-10T00:00:00.000Z'),
    dueDate: new Date('2026-05-10T00:00:00.000Z'),
    description: 'Aluguel maio',
  })
  await ensureTransaction({
    userId: user.id,
    accountId: nubank.id,
    categoryId: investimentos.id,
    type: 'INCOME',
    status: 'PLANNED',
    value: 350,
    competenceDate: new Date('2026-05-20T00:00:00.000Z'),
    dueDate: new Date('2026-05-20T00:00:00.000Z'),
    description: 'Rendimento CDB maio',
  })

  // -- June 2026 --
  await ensureTransaction({
    userId: user.id,
    accountId: nubank.id,
    categoryId: salario.id,
    type: 'INCOME',
    status: 'PLANNED',
    value: 4200,
    competenceDate: new Date('2026-06-05T00:00:00.000Z'),
    dueDate: new Date('2026-06-05T00:00:00.000Z'),
    description: 'Salário mensal junho',
  })
  await ensureTransaction({
    userId: user.id,
    accountId: nubank.id,
    categoryId: assinaturas.id,
    type: 'EXPENSE',
    status: 'PLANNED',
    value: 55.9,
    competenceDate: new Date('2026-06-06T00:00:00.000Z'),
    dueDate: new Date('2026-06-06T00:00:00.000Z'),
    description: 'Spotify junho',
  })
  await ensureTransaction({
    userId: user.id,
    accountId: nubank.id,
    categoryId: lazer.id,
    type: 'EXPENSE',
    status: 'PLANNED',
    value: 300,
    competenceDate: new Date('2026-06-20T00:00:00.000Z'),
    dueDate: new Date('2026-06-20T00:00:00.000Z'),
    description: 'Cinema e lazer junho',
  })

  // -----------------------------------------------------------------------
  // Transfers
  // -----------------------------------------------------------------------
  const transfer1 = await ensureTransfer({
    userId: user.id,
    sourceAccountId: nubank.id,
    destinationAccountId: caixa.id,
    amount: 500,
    description: 'Transferência para reserva janeiro',
    competenceDate: new Date('2026-01-20T00:00:00.000Z'),
    dueDate: new Date('2026-01-20T00:00:00.000Z'),
    paidAt: new Date('2026-01-20T00:00:00.000Z'),
    status: 'PAID',
  })
  const transfer2 = await ensureTransfer({
    userId: user.id,
    sourceAccountId: nubank.id,
    destinationAccountId: caixa.id,
    amount: 500,
    description: 'Transferência para reserva fevereiro',
    competenceDate: new Date('2026-02-20T00:00:00.000Z'),
    dueDate: new Date('2026-02-20T00:00:00.000Z'),
    paidAt: new Date('2026-02-20T00:00:00.000Z'),
    status: 'PAID',
  })
  await ensureTransfer({
    userId: user.id,
    sourceAccountId: nubank.id,
    destinationAccountId: carteira.id,
    amount: 200,
    description: 'Saque para carteira abril',
    competenceDate: new Date('2026-04-05T00:00:00.000Z'),
    dueDate: new Date('2026-04-05T00:00:00.000Z'),
    status: 'PENDING',
  })

  // -----------------------------------------------------------------------
  // Goals
  // -----------------------------------------------------------------------
  const reservaEmergencia = await ensureGoal({
    userId: user.id,
    name: 'Reserva de emergência',
    targetAmount: 10000,
    reserveAccountId: caixa.id,
  })
  const viagem = await ensureGoal({
    userId: user.id,
    name: 'Viagem',
    targetAmount: 5000,
  })

  // -----------------------------------------------------------------------
  // Goal Contributions
  // -----------------------------------------------------------------------
  await ensureGoalContribution({
    goalId: reservaEmergencia.id,
    amount: 500,
    kind: 'CONTRIBUTION',
    transferId: transfer1.id,
  })
  await ensureGoalContribution({
    goalId: reservaEmergencia.id,
    amount: 500,
    kind: 'CONTRIBUTION',
    transferId: transfer2.id,
  })
  await ensureGoalContribution({
    goalId: reservaEmergencia.id,
    amount: 150,
    kind: 'WITHDRAWAL',
  })
  await ensureGoalContribution({
    goalId: reservaEmergencia.id,
    amount: 50,
    kind: 'ADJUSTMENT',
  })
  await ensureGoalContribution({
    goalId: viagem.id,
    amount: 300,
    kind: 'CONTRIBUTION',
  })
  await ensureGoalContribution({
    goalId: viagem.id,
    amount: 200,
    kind: 'CONTRIBUTION',
  })

  // -----------------------------------------------------------------------
  // Recurring Rules
  // -----------------------------------------------------------------------
  await ensureRecurringRule({
    userId: user.id,
    type: 'INCOME',
    description: 'Salário mensal recorrente',
    value: 4200,
    categoryId: salario.id,
    accountId: nubank.id,
    frequency: 'MONTHLY',
    dayOfMonth: 5,
    startDate: new Date('2026-01-05T00:00:00.000Z'),
  })
  await ensureRecurringRule({
    userId: user.id,
    type: 'EXPENSE',
    description: 'Spotify assinatura mensal',
    value: 55.9,
    categoryId: assinaturas.id,
    accountId: nubank.id,
    frequency: 'MONTHLY',
    dayOfMonth: 6,
    startDate: new Date('2026-01-06T00:00:00.000Z'),
  })

  console.log('🌱 Seed finalizado com sucesso!')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})
