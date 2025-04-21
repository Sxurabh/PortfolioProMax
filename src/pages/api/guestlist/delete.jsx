import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (req.method !== "DELETE") return res.status(405).end();
  if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const { id } = req.body;

  try {
    await prisma.guest.delete({ where: { id } });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete guest" });
  }
}
