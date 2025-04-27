
import { PrismaClient } from '@prisma/client';


import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth" // fixed import path

const prisma = new PrismaClient(); 

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isAdmin = session?.user?.email === adminEmail;

  console.log("Logged in as:", session?.user?.email);
  console.log("Admin email:", adminEmail);

  switch (req.method) {
    case 'GET':
      try {
        const guests = await prisma.guest.findMany({
          orderBy: { createdAt: 'desc' },
        });
        return res.status(200).json(guests);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch guests' });
      }

    case 'POST':
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      try {
        const newGuest = await prisma.guest.create({
          data: {
            name,
            addedBy: session?.user?.name || 'Anonymous',
          },
        });
        return res.status(201).json(newGuest);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to add guest' });
      }

    case 'DELETE':
      if (!isAdmin) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Guest ID is required' });
      }

      try {
        await prisma.guest.delete({
          where: { id: parseInt(id) },
        });
        return res.status(200).json({ message: 'Guest deleted' });
      } catch (error) {
        return res.status(500).json({ error: 'Failed to delete guest' });
      }

    case 'PUT':
      if (!isAdmin) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const { guestId, updatedName } = req.body;

      if (!guestId || !updatedName) {
        return res.status(400).json({ error: 'Guest ID and new name are required' });
      }

      try {
        const updatedGuest = await prisma.guest.update({
          where: { id: parseInt(guestId) },
          data: { name: updatedName },
        });
        return res.status(200).json(updatedGuest);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to update guest' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PUT']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
