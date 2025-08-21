// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, Prisma } from "../../generated/prisma"
import { da } from "date-fns/locale";

type Data = {
    name: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>,
) {
    const prisma = new PrismaClient();
    await prisma.overviewData.findMany({

    }).then((data)=>{
        console.log(data.length)
        console.log(data)
    })

    res.status(200).json({ name: "John Doe" });
}
