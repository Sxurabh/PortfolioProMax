// src/pages/api/articles/index.js

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (!session || session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    return res.status(403).json({ message: "Unauthorized" })
  }

  if (req.method === 'POST') {
    try {
      const { title, description, slug, content } = req.body

      const article = await prisma.article.create({
        data: {
          title,
          description,
          slug,
          content,
        },
      })

      return res.status(200).json(article)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: "Error creating article" })
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, title, description, slug, content } = req.body

      const article = await prisma.article.update({
        where: { id },
        data: {
          title,
          description,
          slug,
          content,
        },
      })

      return res.status(200).json(article)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: "Error updating article" })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.body

      await prisma.article.delete({
        where: { id },
      })

      return res.status(200).json({ message: "Article deleted" })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: "Error deleting article" })
    }
  }

  res.setHeader('Allow', ['POST', 'PUT', 'DELETE'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
