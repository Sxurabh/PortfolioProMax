import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import prisma from "../../../src/lib/prisma";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ message: "Unauthorized" });

  if (req.method === "GET") {
    const guests = await prisma.guest.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(guests);
  }

  if (req.method === "POST") {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Name is required" });

    const recent = await prisma.guest.findFirst({
      where: {
        addedBy: session.user.email,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });
    if (recent) return res.status(403).json({ message: "One entry per 24 hours only." });

    const guest = await prisma.guest.create({
      data: {
        name: name.trim(),
        addedBy: session.user.email,
      },
    });
    return res.status(201).json(guest);
  }

  return res.status(405).json({ message: "Method Not Allowed" });
}
