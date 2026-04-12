const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const data = await prisma.typeData.findMany()
  console.log(JSON.stringify(data[0], null, 2))
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
