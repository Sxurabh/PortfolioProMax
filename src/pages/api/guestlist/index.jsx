import axios from "axios";

export default async function handler(req, res) {
  const gistId = process.env.GITHUB_GIST_ID;
  const url = `https://api.github.com/gists/${gistId}`;

  try {
    const { data } = await axios.get(url);
    const content = JSON.parse(
      data.files["guestlist.json"].content
    );
    return res.status(200).json(content.guests);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Could not load guestlist." });
  }
}
