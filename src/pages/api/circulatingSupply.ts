import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const supplyData = await prisma.circulatingSupply.findFirst({
            orderBy: { timestamp: 'desc' }
        });

        if (!supplyData) {
            return res.status(404).json({ error: "No circulating supply data found" });
        }

        res.status(200).json(supplyData);
    } catch (error) {
        console.error("Error fetching circulating supply:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
