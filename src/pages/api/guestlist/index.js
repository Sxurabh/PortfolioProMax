// pages/api/guestlist/index.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name } = req.body;
    const session = req.headers.authorization || null;

    try {
      const guest = await prisma.guest.create({
        data: {
          name,
          addedBy: session || 'Anonymous',
        },
      });
      res.status(200).json(guest);
    } catch (error) {
      res.status(500).json({ message: 'Failed to add guest.' });
    }
  } else if (req.method === 'GET') {
    try {
      const guests = await prisma.guest.findMany({
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json(guests);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch guests.' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
