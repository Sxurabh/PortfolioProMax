// deletes guest by index
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { getGistGuests, updateGistGuests } from "@/utils/gist";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  const adminEmail = process.env.ADMIN_EMAIL;

  if (session?.user?.email !== adminEmail) {
    return res.status(403).json({ success: false, error: "Unauthorized" });
  }

  const { index } = req.body;
  const guests = await getGistGuests();
  guests.splice(index, 1);
  await updateGistGuests(guests);
  res.status(200).json({ success: true, guests });
}
