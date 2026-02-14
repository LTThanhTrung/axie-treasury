import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const data = await prisma.typeData.findMany();

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error finding typeData" });
    }
}
