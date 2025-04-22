import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  const email = session?.user?.email;

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method === "GET") {
    const guests = await prisma.guest.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(guests);
  }

  if (req.method === "POST") {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    // Enforce 24h limit per user
    const lastEntry = await prisma.guest.findFirst({
      where: { addedBy: email },
      orderBy: { createdAt: "desc" },
    });

    if (
      lastEntry &&
      new Date() - new Date(lastEntry.createdAt) < 24 * 60 * 60 * 1000
    ) {
      return res.status(429).json({ message: "One entry allowed every 24 hours" });
    }

    const newGuest = await prisma.guest.create({
      data: {
        name,
        addedBy: email,
      },
    });

    return res.status(201).json(newGuest);
  }

  if (req.method === "DELETE") {
    const { id } = req.body;

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    if (email !== adminEmail) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await prisma.guest.delete({
      where: { id },
    });

    return res.status(200).json({ message: "Guest deleted" });
  }

  res.setHeader("Allow", ["GET", "POST", "DELETE"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
