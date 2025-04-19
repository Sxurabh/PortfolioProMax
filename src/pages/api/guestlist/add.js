import { getSession } from "next-auth/react";
import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const session = await getSession({ req });
  if (!session) return res.status(401).json({ error: "Not authenticated" });

  const { name } = req.body;
  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "Name is required." });
  }

  const gistId = process.env.GITHUB_GIST_ID;
  const gistUrl = `https://api.github.com/gists/${gistId}`;

  try {
    // 1. Read existing
    const { data: gist } = await axios.get(gistUrl, {
      headers: { Authorization: `token ${session.accessToken}` },
    });
    const file = gist.files["guestlist.json"];
    const current = JSON.parse(file.content);
    
    // 2. Append new entry
    current.guests.push({
      name,
      addedBy: session.user.login,
      date: new Date().toISOString()
    });

    // 3. Update the gist
    await axios.patch(
      gistUrl,
      { files: { "guestlist.json": { content: JSON.stringify(current, null, 2) } } },
      { headers: { Authorization: `token ${session.accessToken}` } }
    );

    return res.status(200).json({ success: true, guests: current.guests });
  } catch (err) {
    console.error(err.response?.data || err);
    return res.status(500).json({ error: "Could not update guestlist." });
  }
}
