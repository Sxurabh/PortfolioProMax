import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  const isAdmin = session?.user?.email === process.env.ADMIN_EMAIL;

  if (!session || !isAdmin) {
    return res.status(403).json({ error: "Admin access only" });
  }

  const { id } = req.query;

  if (req.method === "DELETE") {
    await prisma.guest.delete({ where: { id: Number(id) } });
    const guests = await prisma.guest.findMany({ orderBy: { createdAt: "desc" } });
    return res.status(200).json({ success: true, guests });
  }

  if (req.method === "PUT") {
    const { name } = req.body;
    await prisma.guest.update({
      where: { id: Number(id) },
      data: { name },
    });
    const guests = await prisma.guest.findMany({ orderBy: { createdAt: "desc" } });
    return res.status(200).json({ success: true, guests });
  }

  res.setHeader("Allow", ["DELETE", "PUT"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
