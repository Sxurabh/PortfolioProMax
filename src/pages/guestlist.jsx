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
      .then(data => setGuests(Array.isArray(data) ? data : []))
      .catch(() => setGuests([]));
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

  if (status === "loading") {
    return <p className="p-8 text-center text-gray-500">Loading session...</p>;
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded shadow-lg text-center">
          <h1 className="text-2xl font-semibold mb-4">Join the Guestlist</h1>
          <button
            onClick={() => signIn()}
            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition"
          >
            Sign in with GitHub or Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Welcome, {session.user.name || session.user.login}!</h1>
          <button
            onClick={() => signOut()}
            className="text-sm text-red-500 hover:underline"
          >
            Sign out
          </button>
        </div>

        <form onSubmit={addGuest} className="flex gap-2 mb-6">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="flex-grow px-3 py-2 border rounded"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {loading ? "Adding…" : "Add"}
          </button>
        </form>

        <h2 className="text-lg font-semibold mb-2">Past Guests</h2>
        <ul className="space-y-2">
          {guests.map((g, i) => (
            <li key={i} className="border-b pb-2 text-gray-800">
              <strong>{g.name}</strong> — added by {g.addedBy} on {new Date(g.date).toLocaleDateString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
