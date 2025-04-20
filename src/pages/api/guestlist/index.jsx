import fetch from "node-fetch";

const GIST_ID = process.env.GITHUB_GIST_ID;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export default async function handler(req, res) {
  try {
    const gistRes = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
    });

    const gistData = await gistRes.json();
    const fileKey = Object.keys(gistData.files)[0];
    const content = gistData.files[fileKey].content;

    let guests = [];
    try {
      guests = JSON.parse(content || "[]");
    } catch (err) {
      guests = [];
    }

    res.status(200).json(guests);
  } catch (err) {
    console.error("Failed to fetch gist:", err.message);
    res.status(500).json([]);
  }
}
