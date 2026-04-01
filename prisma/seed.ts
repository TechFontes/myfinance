import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding...')

  const passwordHash = await bcrypt.hash('123456', 10)

  const user = await prisma.user.create({
    data: {
      name: 'Daniel Teste',
      email: 'daniel@example.com',
      password: passwordHash,
    },
  })

  console.log('User created:', user.email)

  // Accounts
  const accounts = await prisma.account.createMany({
    data: [
      { name: 'Carteira Física', type: 'WALLET', initialBalance: 250, userId: user.id },
      { name: 'Nubank', type: 'BANK', initialBalance: 1250.5, userId: user.id },
      { name: 'Caixa', type: 'BANK', initialBalance: 3200, userId: user.id },
    ],
  })

  // Categories
  const categories = await prisma.category.createMany({
    data: [
      { name: 'Salário', type: 'INCOME', userId: user.id },
      { name: 'Alimentação', type: 'EXPENSE', userId: user.id },
      { name: 'Assinaturas', type: 'EXPENSE', userId: user.id },
      { name: 'Transporte', type: 'EXPENSE', userId: user.id },
    ],
  })

  // Find for relations
  const nubank = await prisma.account.findFirst({ where: { name: 'Nubank' } })
  const carteira = await prisma.account.findFirst({ where: { name: 'Carteira Física' } })

  const salario = await prisma.category.findFirst({ where: { name: 'Salário' } })
  const assinaturas = await prisma.category.findFirst({ where: { name: 'Assinaturas' } })
  const alimentacao = await prisma.category.findFirst({ where: { name: 'Alimentação' } })

  // Transactions
  await prisma.transaction.createMany({
    data: [
      {
        userId: user.id,
        accountId: nubank!.id,
        categoryId: salario!.id,
        type: 'INCOME',
        status: 'PAID',
        value: 4200,
        competenceDate: new Date(),
        dueDate: new Date(),
        paidAt: new Date(),
        description: 'Salário mensal',
      },
      {
        userId: user.id,
        accountId: nubank!.id,
        categoryId: assinaturas!.id,
        type: 'EXPENSE',
        status: 'PAID',
        value: 55.9,
        competenceDate: new Date(),
        dueDate: new Date(),
        paidAt: new Date(),
        description: 'Spotify',
      },
      {
        userId: user.id,
        accountId: carteira!.id,
        categoryId: alimentacao!.id,
        type: 'EXPENSE',
        status: 'PENDING',
        value: 38.5,
        competenceDate: new Date(),
        dueDate: new Date(),
        description: 'Lanche',
      },
    ],
  })

  console.log('🌱 Seed finalizado com sucesso!')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})
