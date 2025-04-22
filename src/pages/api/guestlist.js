// pages/api/guestlist/index.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default function handler(req, res) {
  if (req.method === "POST") {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    // Simulate adding the guest to a database
    const newGuest = {
      id: Date.now(),
      name,
      addedBy: "Admin", // Replace with session user if applicable
      createdAt: new Date().toISOString(),
    };

    return res.status(200).json(newGuest);
  } else if (req.method === "GET") {
    // Simulate fetching guests from a database
    const guests = [
      { id: 1, name: "John Doe", addedBy: "Admin", createdAt: "2025-04-20T12:00:00Z" },
    ];

    return res.status(200).json(guests);
  } else {
    // Method not allowed
    res.setHeader("Allow", ["POST", "GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}