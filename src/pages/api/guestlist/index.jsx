import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) return res.status(401).json({ error: "Not authenticated" });

  if (req.method === "GET") {
    const guests = await prisma.guest.findMany({ orderBy: { createdAt: "desc" } });
    return res.status(200).json(guests);
  }

  if (req.method === "POST") {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    // Check if this user already added entry in last 24 hours
    const recent = await prisma.guest.findFirst({
      where: {
        addedBy: session.user.email || session.user.name,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    if (recent) {
      return res.status(403).json({ error: "You can only add one entry per 24 hours." });
    }

    const guest = await prisma.guest.create({
      data: {
        name: name.trim(),
        addedBy: session.user.email || session.user.name,
      },
    });

    const guests = await prisma.guest.findMany({ orderBy: { createdAt: "desc" } });
    return res.status(200).json({ success: true, guests });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
