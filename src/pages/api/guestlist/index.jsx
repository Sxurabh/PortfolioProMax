import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const guests = await prisma.guest.findMany({
      orderBy: { date: "desc" }
    });
    res.status(200).json(guests);
  } catch (error) {
    console.error("GET guests error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
