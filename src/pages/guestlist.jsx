import { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

export default function GuestlistPage() {
  const { data: session, status } = useSession();
  const [guests, setGuests] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const guestsPerPage = 5;

  useEffect(() => {
    fetch("/api/guestlist")
      .then(res => res.json())
      .then(data => {
        setGuests(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        toast.error("Failed to fetch guest list.");
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
      toast.success("Added to guest list!");
    } else {
      toast.error(data.error || "Something went wrong");
    }
    setLoading(false);
  };

  const filteredGuests = guests.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredGuests.length / guestsPerPage);
  const displayedGuests = filteredGuests.slice(
    (currentPage - 1) * guestsPerPage,
    currentPage * guestsPerPage
  );

  if (status === "loading") return <p className="p-8">Loading session...</p>;

  if (!session) {
    return (
      <div className="p-8 text-center">
        <Toaster />
        <h1 className="text-3xl font-bold mb-4">Guestlist</h1>
        <button
          onClick={() => signIn()}
          className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition"
        >
          Sign in with GitHub or Google
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <Toaster />
      <h1 className="text-3xl font-semibold mb-2">
        Welcome, {session.user.name || session.user.login}!
      </h1>
      <button
        onClick={() => signOut()}
        className="mb-6 text-sm text-blue-500 hover:underline"
      >
        Sign out
      </button>

      <form onSubmit={addGuest} className="mb-6 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="border px-3 py-2 flex-grow rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Adding…" : "Add"}
        </button>
      </form>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
        placeholder="Search guests..."
        className="mb-4 border px-3 py-2 w-full rounded"
      />

      <h2 className="text-xl font-semibold mb-3">Past Guests</h2>
      <ul className="space-y-2">
        {displayedGuests.length === 0 ? (
          <p>No guests found.</p>
        ) : (
          displayedGuests.map((g, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-100 p-3 rounded shadow-sm"
            >
              <strong>{g.name}</strong> — added by {g.addedBy} on{" "}
              {new Date(g.date).toLocaleDateString()}
            </motion.li>
          ))
        )}
      </ul>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: totalPages }, (_, idx) => (
            <button
              key={idx + 1}
              onClick={() => setCurrentPage(idx + 1)}
              className={`px-3 py-1 border rounded ${
                currentPage === idx + 1
                  ? "bg-blue-600 text-white"
                  : "bg-white text-black"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
