import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = await prisma.dailyBAXS.findMany({
      orderBy: {
        date: 'asc'
      }
    })
    res.status(200).json(data)
  } catch (error) {
    console.error('API Error (dailyBAXS):', error)
    res.status(500).json({ error: 'Internal Server Error' })
  } finally {
    await prisma.$disconnect()
  }
}
