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
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const guestsPerPage = 5;

  const isAdmin = session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    try {
      const res = await fetch("/api/guestlist");
      const data = await res.json();
      setGuests(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to fetch guest list.");
      setGuests([]);
    }
  };

  const addGuest = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    const res = await fetch("/api/guestlist", {
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

  const deleteGuest = async (id) => {
    const res = await fetch(`/api/guestlist/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();
    if (res.ok && data.success) {
      setGuests(data.guests);
      toast.success("Entry deleted!");
    } else {
      toast.error("Failed to delete");
    }
  };

  const startEditing = (id, currentName) => {
    setEditingId(id);
    setEditedName(currentName);
  };

  const saveEdit = async () => {
    const res = await fetch(`/api/guestlist/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editedName }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      setGuests(data.guests);
      toast.success("Guest updated!");
      setEditingId(null);
      setEditedName("");
    } else {
      toast.error("Failed to update");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditedName("");
  };

  const filteredGuests = guests.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredGuests.length / guestsPerPage);
  const displayedGuests = filteredGuests.slice(
    (currentPage - 1) * guestsPerPage,
    currentPage * guestsPerPage
  );

  if (status === "loading") return <div className="p-8 text-center">Loading...</div>;

  if (!session) {
    return (
      <div className="p-8 text-center">
        <Toaster />
        <h1 className="text-3xl font-bold mb-4 dark:text-zinc-400">Guestlist</h1>
        <button
          onClick={() => signIn(undefined, { redirect: false })}
          className="bg-black text-white px-6 py-2 rounded-xl hover:hover:text-teal-500 dark:hover:text-teal-400 transition"
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

      {isAdmin && (
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
      )}

      <h2 className="text-xl font-semibold mb-3 dark:text-zinc-400">Past Guests</h2>
      <ul className="space-y-2">
        {displayedGuests.length === 0 ? (
          <p>No guests found.</p>
        ) : (
          displayedGuests.map((g, i) => (
            <motion.li
              key={g.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-100 p-3 rounded-full shadow-sm dark:bg-zinc-800 dark:text-zinc-200"
            >
              {editingId === g.id ? (
                <div className="flex items-center gap-2">
                  <input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="flex-grow rounded px-2 py-1 border dark:bg-zinc-700 dark:text-zinc-200"
                  />
                  <button onClick={saveEdit} className="text-green-600 font-medium">Save</button>
                  <button onClick={cancelEdit} className="text-red-500">Cancel</button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span>
                    <strong>{g.name}</strong> — added by {g.addedBy} on{" "}
                    {new Date(g.createdAt).toLocaleDateString()}
                  </span>
                  {isAdmin && (
                    <div className="flex gap-2 text-sm ml-4">
                      <button onClick={() => startEditing(g.id, g.name)} className="text-blue-600">Edit</button>
                      <button onClick={() => deleteGuest(g.id)} className="text-red-600">Delete</button>
                    </div>
                  )}
                </div>
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
