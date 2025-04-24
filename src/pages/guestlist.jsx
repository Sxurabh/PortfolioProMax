// pages/guestlist.jsx

import { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { toast, Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { FaSpinner } from "react-icons/fa";

export default function GuestlistPage() {
  const { data: session, status } = useSession();
  const [guests, setGuests] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const guestsPerPage = 5;

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isAdmin = session?.user?.email === adminEmail;

  useEffect(() => {
    if (!session) return;
    fetch("/api/guestlist-test")
      .then((res) => res.json())
      .then((data) => setGuests(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Failed to fetch guest list"));
  }, [session]);

  const addGuest = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Please enter a name");

    setLoading(true);
    try {
      const res = await fetch("/api/guestlist-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim().slice(0, 50) }),
      });
      const data = await res.json();
      if (res.ok) {
        setGuests([data, ...guests]);
        setName("");
        toast.success("Added to guest list!");
      } else {
        toast.error(data.error || "Could not add guest.");
      }
    } catch {
      toast.error("Server error. Try again later.");
    }
    setLoading(false);
  };

  const deleteGuest = async (id) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      const res = await fetch("/api/guestlist-test", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setGuests(guests.filter((g) => g.id !== id));
        toast.success("Guest deleted");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete guest");
      }
    } catch {
      toast.error("Delete failed. Try again.");
    }
  };

  const updateGuest = async (id) => {
    if (!editedName.trim()) return toast.error("Name cannot be empty");

    try {
      const res = await fetch("/api/guestlist-test", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId: id, updatedName: editedName.trim().slice(0, 50) }),
      });

      if (res.ok) {
        const updated = await res.json();
        setGuests(
          guests.map((g) => (g.id === id ? { ...g, name: updated.name } : g))
        );
        toast.success("Updated successfully");
        setEditingId(null);
        setEditedName("");
      } else {
        const data = await res.json();
        toast.error(data.error || "Update failed");
      }
    } catch {
      toast.error("Update failed");
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

  if (status === "loading") return <div className="p-8 text-center">Loading...</div>;

  if (!session) {
    return (
      <div className="p-8 text-center">
        <Toaster />
        <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">Be my guest and leave a message! :)</h1>
        <button
          onClick={() => signIn()}
          className="bg-zinc-600 dark:bg-zinc-600 text-white dark:text-black dark:hover:text-teal-400 px-6 py-2 rounded-xl hover:text-teal-400 transition"
        >
          Sign in with GitHub or Google 
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Toaster />
      <h1 className="text-2xl font-bold mb-2 dark:text-zinc-200">
        Welcome, {session.user.name || session.user.login}!
      </h1>
      <button onClick={() => signOut()} className="mb-6 text-sm text-blue-500 hover:underline">
        Sign out
      </button>

      <form onSubmit={addGuest} className="mb-6 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          maxLength={50}
          className="border px-3 py-2 flex-grow rounded-full dark:bg-zinc-800 dark:text-white"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 flex items-center gap-2"
        >
          {loading ? <FaSpinner className="animate-spin" /> : "Add"}
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
        className="mb-4 border px-3 py-2 w-full rounded-full dark:bg-zinc-800 dark:text-white"
      />

      <ul className="space-y-2">
        <AnimatePresence>
          {displayedGuests.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-gray-500"
            >
              No guests found.
            </motion.p>
          ) : (
            displayedGuests.map((g) => (
              <motion.li
                key={g.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className={`p-3 rounded-full shadow-sm dark:bg-zinc-800 dark:text-white flex justify-between items-center ${
                  g.addedBy === session.user.name ? "border-l-4 border-blue-400" : ""
                }`}
              >
                <div className="flex-grow">
                  {editingId === g.id ? (
                    <div className="flex gap-2">
                      <input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="border px-2 py-1 rounded dark:bg-zinc-700"
                      />
                      <button onClick={() => updateGuest(g.id)} className="text-green-500 text-sm">
                        Save
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-gray-500 text-sm">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <strong>{g.name}</strong> — added by {g.addedBy} on{" "}
                      {new Date(g.createdAt).toLocaleDateString()}
                    </>
                  )}
                </div>
                {isAdmin && editingId !== g.id && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setEditingId(g.id);
                        setEditedName(g.name);
                      }}
                      className="text-blue-500 hover:underline text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteGuest(g.id)}
                      className="text-red-500 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </motion.li>
            ))
          )}
        </AnimatePresence>
      </ul>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: totalPages }, (_, idx) => (
            <button
              key={idx + 1}
              onClick={() => setCurrentPage(idx + 1)}
              className={`px-3 py-1 border rounded-full ${
                currentPage === idx + 1
                  ? "bg-blue-600 text-white"
                  : "bg-white text-black dark:bg-zinc-700 dark:text-white"
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
