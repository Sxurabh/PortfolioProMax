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
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  const isAdmin = session?.user?.email === adminEmail;

  useEffect(() => {
    if (!session) return;
    fetch("pages/api/guestlist/index.js")
      .then(res => res.json())
      .then(data => setGuests(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Failed to fetch guest list"));
  }, [session]);

  const addGuest = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("pages/api/guestlist/index.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      if (res.ok) {
        setGuests([data, ...guests]);
        setName("");
        toast.success("Added to guest list!");
      } else {
        toast.error(data.message || "Could not add guest.");
      }
    } catch {
      toast.error("Server error. Try again later.");
    }

    setLoading(false);
  };

  const deleteGuest = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this entry?");
    if (!confirmDelete) return;

    try {
      const res = await fetch("/api/guestlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setGuests(guests.filter((g) => g.id !== id));
        toast.success("Guest deleted");
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to delete guest");
      }
    } catch {
      toast.error("Delete failed. Try again.");
    }
  };

  const filteredGuests = guests.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredGuests.length / guestsPerPage);
  const displayedGuests = filteredGuests.slice(
    (currentPage - 1) * guestsPerPage,
    currentPage * guestsPerPage
  );

  if (status === "loading") return <div className="p-8 text-center dark:text-zinc-400">Loading...</div>;

  if (!session) {
    return (
      <div className="p-8 text-center">
        <Toaster />
        <h1 className="text-3xl font-bold mb-4 dark:text-zinc-400">Guestlist</h1>
        <button
          onClick={() => signIn(undefined, { redirect: false })}
          className="bg-black text-white px-6 py-2 rounded-xl hover:text-teal-500 dark:hover:text-teal-400 transition"
        >
          Sign in with GitHub or Google
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <Toaster />
      <h1 className="text-3xl font-semibold mb-2 dark:text-zinc-400">
        Welcome, {session.user.name || session.user.login}!
      </h1>
      <button
        onClick={() => signOut()}
        className="mb-6 text-sm text-blue-500 hover:underline dark:text-zinc-400"
      >
        Sign out
      </button>

      <form onSubmit={addGuest} className="mb-6 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="border px-3 py-2 flex-grow rounded-full dark:bg-zinc-800 dark:text-zinc-200"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
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
        className="mb-4 border px-3 py-2 w-full rounded-full dark:bg-zinc-800 dark:text-zinc-200"
      />

      <h2 className="text-xl font-semibold mb-3 dark:text-zinc-400">Past Guests</h2>
      <ul className="space-y-2">
        {displayedGuests.length === 0 ? (
          <p>No guests found.</p>
        ) : (
          displayedGuests.map((g) => (
            <motion.li
              key={g.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-100 p-3 rounded-full shadow-sm dark:bg-zinc-800 dark:text-zinc-200 flex justify-between items-center"
            >
              <div>
                <strong>{g.name}</strong> — added by {g.addedBy} on{" "}
                {new Date(g.createdAt).toLocaleDateString()}
              </div>
              {isAdmin && (
                <button
                  onClick={() => deleteGuest(g.id)}
                  className="text-red-500 hover:underline ml-4 text-sm"
                >
                  Delete
                </button>
              )}
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
