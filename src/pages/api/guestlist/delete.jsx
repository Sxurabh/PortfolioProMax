import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import prisma from "../../../src/lib/prisma";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ message: "Unauthorized" });

  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { id } = req.body;
  if (!id) return res.status(400).json({ message: "ID is required" });

  const adminEmail = process.env.ADMIN_EMAIL; // define in .env
  if (session.user.email !== adminEmail) {
    return res.status(403).json({ message: "Only admin can delete entries." });
  }

  await prisma.guest.delete({ where: { id } });
  return res.status(200).json({ message: "Deleted" });
}
