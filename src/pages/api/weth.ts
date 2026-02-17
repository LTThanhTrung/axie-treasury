import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { flattenAndSumTokens } from "@/lib/utils";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const typeData = await prisma.typeData.findMany();

        if (!typeData || typeData.length === 0) {
            return res.status(200).json({ weth: 0, formatted: "0" });
        }

        let flattenedData = flattenAndSumTokens(typeData[0] as any);
        const wethAddress = "0xc99a6a985ed2cac1ef41640596c5a5f9f4e19ef5";

        // Calculate WETH amount (Total WETH - 56078 used for hack coverage)
        let wethAmount = (flattenedData[wethAddress] || 0) - 56078;

        res.status(200).json({
            axie_treasury_eth: wethAmount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error calculating WETH amount" });
    }
}
