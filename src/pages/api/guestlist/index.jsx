import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ message: "Unauthorized" });

  const userEmail = session.user.email;
  const isAdmin = userEmail === "YOUR_ADMIN_EMAIL@gmail.com"; // <- change this to your email

  // GET all guests
  if (req.method === "GET") {
    const guests = await prisma.guest.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(guests);
  }

  // POST - add new guest
  if (req.method === "POST") {
    const { name } = req.body;
    const addedBy = session.user.name || session.user.login || userEmail;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const recent = await prisma.guest.findFirst({
      where: {
        addedBy,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // last 24 hrs
        },
      },
    });

    if (recent) {
      return res.status(403).json({ message: "One entry per 24 hours only." });
    }

    const guest = await prisma.guest.create({
      data: {
        name: name.trim(),
        addedBy,
      },
    });

    return res.status(201).json(guest);
  }

  // DELETE - admin only
  if (req.method === "DELETE") {
    if (!isAdmin) {
      return res.status(403).json({ message: "Only admin can delete entries." });
    }

    const { id } = req.body;
    if (!id) return res.status(400).json({ message: "Guest ID is required." });

    try {
      await prisma.guest.delete({ where: { id } });
      return res.status(200).json({ message: "Deleted successfully." });
    } catch (error) {
      console.error("Delete error:", error);
      return res.status(500).json({ message: "Error deleting guest." });
    }
  }

  return res.status(405).json({ message: "Method Not Allowed" });
}
