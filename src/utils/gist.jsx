import fetch from "node-fetch";

const GIST_ID = process.env.GITHUB_GIST_ID;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export async function getGistGuests() {
  const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
    },
  });

  const gist = await res.json();
  const fileKey = Object.keys(gist.files)[0];
  const content = gist.files[fileKey].content;
  return JSON.parse(content || "[]");
}

export async function updateGistGuests(guests) {
  const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
    },
    body: JSON.stringify({
      files: {
        "guests.json": {
          content: JSON.stringify(guests, null, 2),
        },
      },
    }),
  });

  return await res.json();
}
