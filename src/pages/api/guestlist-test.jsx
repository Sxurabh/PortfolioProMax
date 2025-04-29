import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

let prisma;
if (!global.prisma) {
  global.prisma = new PrismaClient();
}
prisma = global.prisma;

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isAdmin = session?.user?.email === adminEmail;

  console.log("📢 Logged in as:", session?.user?.email || "Unauthenticated");
  console.log("🔐 Admin email set to:", adminEmail);

  try {
    switch (req.method) {
      case "GET":
        const guests = await prisma.guest.findMany({
          orderBy: { createdAt: "desc" },
        });
        return res.status(200).json(guests);

      case "POST":
        if (!session) {
          return res.status(401).json({ error: "Unauthorized" });
        }

        const { name } = req.body;
        if (!name?.trim()) {
          return res.status(400).json({ error: "Name is required" });
        }

        const newGuest = await prisma.guest.create({
          data: {
            name: name.trim(),
            addedBy: session.user.name || "Anonymous",
          },
        });
        return res.status(201).json(newGuest);

      case "DELETE":
        if (!isAdmin) {
          return res.status(403).json({ error: "Unauthorized" });
        }

        const { id } = req.body;
        if (!id) {
          return res.status(400).json({ error: "Guest ID is required" });
        }

        await prisma.guest.delete({
          where: { id: parseInt(id) },
        });
        return res.status(200).json({ message: "Guest deleted" });

      case "PUT":
        if (!isAdmin) {
          return res.status(403).json({ error: "Unauthorized" });
        }

        const { guestId, updatedName } = req.body;
        if (!guestId || !updatedName?.trim()) {
          return res.status(400).json({ error: "Guest ID and new name are required" });
        }

        const updatedGuest = await prisma.guest.update({
          where: { id: parseInt(guestId) },
          data: { name: updatedName.trim() },
        });
        return res.status(200).json(updatedGuest);

      default:
        res.setHeader("Allow", ["GET", "POST", "DELETE", "PUT"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("❌ API Error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
