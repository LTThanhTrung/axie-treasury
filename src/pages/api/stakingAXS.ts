import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        // Fetch all data and filter in memory for "last record of each day"
        // Alternatively, use an aggregation if the dataset is huge, but for now this is simpler
        // and ensures we get the exact document structure.
        const allData = await prisma.stakingAXS.findMany({
            orderBy: {
                timestamp: 'asc'
            }
        });

        // Group by date and take the last one
        const dailyDataMap = new Map();
        allData.forEach((item) => {
            dailyDataMap.set(item.date, item);
        });

        const dailyData = Array.from(dailyDataMap.values());

        res.status(200).json(dailyData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error finding stakingAXS data" });
    }
}
