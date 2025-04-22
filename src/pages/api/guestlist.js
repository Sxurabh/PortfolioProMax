import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  console.log("Request Method:", req.method);
  console.log("Request Body:", req.body);

  if (req.method === "POST") {
    const { name } = req.body;

    if (!name) {
      console.error("Name is missing");
      return res.status(400).json({ message: "Name is required" });
    }

    try {
      const newGuest = await prisma.guest.create({
        data: {
          name,
          addedBy: "Admin",
        },
      });

      console.log("New Guest Added:", newGuest);
      return res.status(200).json(newGuest);
    } catch (error) {
      console.error("Error adding guest:", error);
      return res.status(500).json({ message: "Failed to add guest" });
    }
  } else if (req.method === "GET") {
    try {
      const guests = await prisma.guest.findMany();
      console.log("Guests Fetched:", guests);
      return res.status(200).json(guests);
    } catch (error) {
      console.error("Error fetching guests:", error);
      return res.status(500).json({ message: "Failed to fetch guests" });
    }
  } else {
    console.error("Method Not Allowed:", req.method);
    res.setHeader("Allow", ["POST", "GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}