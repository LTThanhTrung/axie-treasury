import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        // Fetch all daily breakdown records ordered by date
        const data = await (prisma as any).dailyAXS.findMany({
            orderBy: {
                date: 'asc'
            }
        });

        if (!data || data.length === 0) {
            return res.status(404).json({ error: "No Daily AXS Inflow data found" });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error finding dailyAXS data" });
    }
}
