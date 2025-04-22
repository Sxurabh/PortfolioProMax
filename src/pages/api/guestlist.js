import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    try {
      // Add the guest to the database
      const newGuest = await prisma.guest.create({
        data: {
          name,
          addedBy: "Admin", // Replace with session user if applicable
        },
      });

      return res.status(200).json(newGuest);
    } catch (error) {
      console.error("Error adding guest:", error);
      return res.status(500).json({ message: "Failed to add guest" });
    }
  } else if (req.method === "GET") {
    try {
      // Fetch guests from the database
      const guests = await prisma.guest.findMany();
      return res.status(200).json(guests);
    } catch (error) {
      console.error("Error fetching guests:", error);
      return res.status(500).json({ message: "Failed to fetch guests" });
    }
  } else {
    // Method not allowed
    res.setHeader("Allow", ["POST", "GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}