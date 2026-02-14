import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        await prisma.$connect();

        res.status(200).json({ status: "Conectado com sucesso" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao conectar" });
    }
}
