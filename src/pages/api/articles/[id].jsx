// src/pages/api/articles/[id].js

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { id } = req.query;

  if (req.method === "DELETE") {
    try {
      await prisma.article.delete({
        where: { id: Number(id) },
      });
      res.status(200).json({ message: "Article deleted" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error deleting article" });
    }
  } else if (req.method === "PUT") {
    const { title, description, content } = req.body;

    try {
      const updatedArticle = await prisma.article.update({
        where: { id: Number(id) },
        data: { title, description, content },
      });
      res.status(200).json(updatedArticle);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating article" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}