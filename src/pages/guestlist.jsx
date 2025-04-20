import { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

export default function GuestlistPage() {
  const { data: session } = useSession();
  const [guests, setGuests] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch existing guests
  useEffect(() => {
    fetch("/api/guestlist")
      .then(res => res.json())
      .then(data => {
        setGuests(Array.isArray(data) ? data : []); // Ensure guests is always an array
      })
      .catch(err => {
        console.error(err);
        setGuests([]); // Fallback to an empty array on error
      });
  }, []);

  const addGuest = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    const res = await fetch("/api/guestlist/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    const data = await res.json();
    if (data.success) {
      setGuests(data.guests);
      setName("");
    } else {
      alert(data.error);
    }
    setLoading(false);
  };

  if (!session) {
    return (
      <div className="p-8">
        <h1>Guestlist</h1>
        <button onClick={() => signIn("github")} className="btn">
          Log in with GitHub
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1>Welcome, {session.user.name || session.user.login}!</h1>
      <button onClick={() => signOut()} className="btn mb-4">
        Sign out
      </button>

      <form onSubmit={addGuest} className="mb-6">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your name"
          className="border px-2 py-1 mr-2"
        />
        <button type="submit" disabled={loading} className="btn">
          {loading ? "Adding…" : "Add to Guestlist"}
        </button>
      </form>

      <h2>Past Guests</h2>
      <ul>
        {guests.map((g, i) => (
          <li key={i}>
            <strong>{g.name}</strong>—
            added by {g.addedBy} on {new Date(g.date).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
