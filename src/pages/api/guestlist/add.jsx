import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import fetch from "node-fetch";

const GIST_ID = process.env.GITHUB_GIST_ID;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    console.error("⛔ No session found");
    return res.status(401).json({ success: false, error: "Not authenticated" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, error: "Name is required" });
  }

  try {
    const gistRes = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!gistRes.ok) {
      const errData = await gistRes.text();
      console.error("❌ Error fetching Gist:", errData);
      throw new Error("Failed to fetch Gist");
    }

    const gistData = await gistRes.json();
    const fileKey = Object.keys(gistData.files)[0];

    if (!fileKey) {
      throw new Error("⚠️ No file found in Gist. Please check your GIST ID.");
    }

    const content = gistData.files[fileKey].content;

    let guests = [];
    try {
      guests = JSON.parse(content || "[]");
    } catch (err) {
      console.error("⚠️ Could not parse existing guests JSON:", err.message);
    }

    const newGuest = {
      name: name.trim(),
      addedBy: session.user.name || session.user.login,
      date: new Date().toISOString(),
    };

    guests.push(newGuest);

    const updatedRes = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify({
        files: {
          [fileKey]: {
            content: JSON.stringify(guests, null, 2),
          },
        },
      }),
    });

    if (!updatedRes.ok) {
      const updateErr = await updatedRes.text();
      console.error("❌ Failed to update gist:", updateErr);
      throw new Error("Failed to update gist");
    }

    res.status(200).json({ success: true, guests });
  } catch (error) {
    console.error("🔥 Error in add API:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}
