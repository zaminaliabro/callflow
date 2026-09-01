import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const CALL_STATUS = ['INTERESTED', 'NOT_INTERESTED', 'CALLBACK', 'NO_ANSWER', 'SALE']
const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta']
const FIRST = ['Ali', 'Sara', 'Bilal', 'Ayesha', 'Usman', 'Hina', 'Kashif', 'Nadia', 'Fahad', 'Zoya', 'Imran', 'Mariam']
const LAST = ['Khan', 'Ahmed', 'Malik', 'Sheikh', 'Butt', 'Raza', 'Qureshi', 'Farooq', 'Iqbal', 'Hussain']

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)]
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const phone = () => '03' + randInt(0, 4) + String(randInt(0, 9999999)).padStart(7, '0')

async function main() {
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@callflow.test').toLowerCase()
  const adminPass = process.env.SEED_ADMIN_PASSWORD || 'admin123'

  console.log('Clearing existing data…')
  await prisma.call.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.user.deleteMany()

  console.log('Creating admin…')
  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      email: adminEmail,
      role: 'ADMIN',
      passwordHash: await bcrypt.hash(adminPass, 10),
      monthlyTarget: 0,
    },
  })

  console.log('Creating agents…')
  const agentDefs = [
    { name: 'Hamza Tariq', email: 'hamza@callflow.test', monthlyTarget: 300000 },
    { name: 'Sana Javed', email: 'sana@callflow.test', monthlyTarget: 250000 },
    { name: 'Bilal Aslam', email: 'bilal@callflow.test', monthlyTarget: 200000 },
    { name: 'Rabia Noor', email: 'rabia@callflow.test', monthlyTarget: 350000 },
  ]
  const agents = []
  for (const def of agentDefs) {
    agents.push(
      await prisma.user.create({
        data: {
          name: def.name,
          email: def.email,
          role: 'AGENT',
          phone: phone(),
          monthlyTarget: def.monthlyTarget,
          passwordHash: await bcrypt.hash('agent123', 10),
        },
      }),
    )
  }

  console.log('Creating customers…')
  const customers = []
  for (let i = 0; i < 60; i++) {
    const agent = Math.random() < 0.85 ? rand(agents) : null
    customers.push(
      await prisma.customer.create({
        data: {
          name: `${rand(FIRST)} ${rand(LAST)}`,
          phone: phone(),
          email: Math.random() < 0.6 ? `lead${i}@example.com` : null,
          city: rand(CITIES),
          notes: Math.random() < 0.3 ? 'Referred by existing client.' : null,
          assignedAgentId: agent?.id || null,
          createdById: admin.id,
        },
      }),
    )
  }

  console.log('Creating call history (last 30 days)…')
  let calls = 0
  for (const customer of customers) {
    if (!customer.assignedAgentId) continue
    const n = randInt(0, 5)
    for (let k = 0; k < n; k++) {
      const status = rand(CALL_STATUS)
      const daysBack = randInt(0, 29)
      const createdAt = new Date()
      createdAt.setDate(createdAt.getDate() - daysBack)
      createdAt.setHours(randInt(9, 18), randInt(0, 59), 0, 0)
      const isSale = status === 'SALE'

      await prisma.call.create({
        data: {
          customerId: customer.id,
          agentId: customer.assignedAgentId,
          status,
          notes: isSale ? 'Closed the deal.' : rand(['Left voicemail.', 'Will call back later.', 'Asked for brochure.', '']),
          saleAmount: isSale ? randInt(10, 120) * 1000 : 0,
          followUpAt:
            status === 'CALLBACK'
              ? new Date(Date.now() + randInt(1, 7) * 864e5)
              : null,
          createdAt,
        },
      })
      calls++

      // Reflect the latest call on the customer row.
      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          status,
          lastCallAt: createdAt,
          nextFollowUpAt:
            status === 'CALLBACK' ? new Date(Date.now() + randInt(1, 7) * 864e5) : customer.nextFollowUpAt,
        },
      })
    }
  }

  console.log('\n─────────────────────────────────────')
  console.log(`  Admin:  ${adminEmail}  /  ${adminPass}`)
  console.log(`  Agents: hamza@callflow.test … /  agent123`)
  console.log(`  ${agents.length} agents, ${customers.length} customers, ${calls} calls`)
  console.log('─────────────────────────────────────\n')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
