import { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

export default function GuestlistPage() {
  const { data: session, status } = useSession();
  const [guests, setGuests] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/guestlist")
      .then(res => res.json())
      .then(data => {
        setGuests(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error(err);
        setGuests([]);
      });
  }, []);

  const addGuest = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    const res = await fetch("/api/guestlist/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      setGuests(data.guests);
      setName("");
    } else {
      alert(data.error || "Something went wrong");
    }
    setLoading(false);
  };

  if (status === "loading") return <p className="p-8">Loading session...</p>;

  if (!session) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold mb-2">Guestlist</h1>
        <button
          onClick={() => signIn("github")}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Log in with GitHub
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold">Welcome, {session.user.name || session.user.login}!</h1>
      <button
        onClick={() => signOut()}
        className="bg-gray-200 px-3 py-1 rounded my-4"
      >
        Sign out
      </button>

      <form onSubmit={addGuest} className="mb-6">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="border px-2 py-1 mr-2 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-1 rounded"
        >
          {loading ? "Adding…" : "Add to Guestlist"}
        </button>
      </form>

      <h2 className="text-lg font-medium mb-2">Past Guests</h2>
      <ul className="list-disc pl-5 space-y-1">
        {guests.map((g, i) => (
          <li key={i}>
            <strong>{g.name}</strong> — added by {g.addedBy} on{" "}
            {new Date(g.date).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
