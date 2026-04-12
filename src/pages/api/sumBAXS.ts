import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = await prisma.sumBAXS.findUnique({
      where: { id: 'global_totals' }
    })
    
    if (!data) {
      return res.status(404).json({ error: 'Summary data for bAXS not found' })
    }

    res.status(200).json(data)
  } catch (error) {
    console.error('API Error (sumBAXS):', error)
    res.status(500).json({ error: 'Internal Server Error' })
  } finally {
    await prisma.$disconnect()
  }
}
