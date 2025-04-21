import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (req.method !== "POST") return res.status(405).end();
  if (!session) return res.status(401).json({ error: "Not authenticated" });

  const { name } = req.body;
  const addedBy = session.user.name || session.user.login;

  if (!name || !addedBy) return res.status(400).json({ error: "Missing data" });

  try {
    // 24-hour restriction
    const last = await prisma.guest.findFirst({
      where: { addedBy },
      orderBy: { date: "desc" }
    });

    const now = new Date();
    if (last && (now - new Date(last.date)) / (1000 * 60 * 60) < 24) {
      return res.status(400).json({ error: "Only 1 entry allowed in 24 hours." });
    }

    const guest = await prisma.guest.create({
      data: { name, addedBy }
    });

    res.status(200).json({ success: true, guest });
  } catch (error) {
    console.error("POST error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
