// pages/guestlist.jsx

import { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { toast, Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { FaSpinner } from "react-icons/fa";
import Head from 'next/head'; // 1. Import the Head component

export default function GuestlistPage() {
  const { data: session, status } = useSession();
  const [guests, setGuests] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingGuests, setFetchingGuests] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const guestsPerPage = 5;

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isAdmin = session?.user?.email === adminEmail;

  useEffect(() => {
    if (!session) return;
    setFetchingGuests(true);
    fetch("/api/guestlist-test")
      .then((res) => res.json())
      .then((data) => setGuests(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Failed to fetch guest list"))
      .finally(() => setFetchingGuests(false));
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
    setLoading(true);
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
    setLoading(false);
  };

  const updateGuest = async (id) => {
    if (!editedName.trim()) return toast.error("Name cannot be empty");

    setLoading(true);
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

  // --- Conditional Rendering ---

  if (status === "loading") {
    return (
       // Optionally add a Head component here too for loading state
       <>
        <Head>
            <title>Loading Guest List...</title>
        </Head>
        <div className="p-8 text-center">Loading session...</div>
       </>
    );
  }

  if (!session) {
    return (
      // Use a Fragment <>...</> to return multiple elements
      <>
        <Head>
          <title>Guestlist - Saurabh Kirve</title> {/* Title for the sign-in page */}
        </Head>
        <div className="flex flex-col justify-center items-center h-screen gap-6 px-6">
          <Toaster />
          <h1 className="text-3xl sm:text-5xl font-bold text-center text-zinc-900 dark:text-white">
            Be my guest
            <br /> {/* Added line break for potentially better formatting */}
            and add your name to the list!
          </h1>
          <button
            onClick={() => signIn()}
            className="px-6 py-3 bg-zinc-800 text-white dark:bg-zinc-700 rounded-xl dark:hover:bg-teal-500 hover:bg-teal-500 hover:scale-105 transition transform"
          >
            Sign in with GitHub or Google
          </button>
        </div>
      </>
    );
  }

  // --- Main Logged-in View ---
  return (
    // 2. Wrap the main return in a Fragment <>...</>
    <>
      {/* 3. Add the Head component and the title tag inside it */}
      <Head>
        <title>Guest List - Manage Entries</title> {/* <-- YOUR BROWSER TAB TITLE */}
        {/* You can add other head elements here too, like meta tags */}
        {/* <meta name="description" content="Manage the guest list entries" /> */}
      </Head>

      {/* --- Existing component structure starts here --- */}
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <Toaster />

        {/* Avatar Section */}
        <div className="flex items-center gap-4 mb-6">
          <img
            src={session.user.image || '/default-avatar.png'}
            alt="Avatar"
            className="w-14 h-14 rounded-full border dark:border-zinc-700"
          />
          <div>
            <h2 className="text-2xl font-semibold dark:text-white">{session.user.name}</h2>
            <button
              onClick={() => signOut()}
              className="text-sm text-teal-500 hover:underline"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Add Form */}
        <form onSubmit={addGuest} className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="flex-1 px-4 py-2 border rounded-xl dark:bg-zinc-800 dark:text-white"
            maxLength={50} // Good practice to match backend limit
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl transition transform hover:scale-105"
          >
            {loading ? <FaSpinner className="animate-spin" /> : "Add"}
          </button>
        </form>

        {/* Search */}
        <input
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to first page on search
          }}
          placeholder="Search guests..."
          className="mb-6 w-full px-4 py-2 border rounded-xl dark:bg-zinc-800 dark:text-white"
        />

        {/* Guest List */}
        <ul className="space-y-4">
          <AnimatePresence>
            {fetchingGuests ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-gray-500 dark:text-gray-400"
              >
                Fetching guest list...
              </motion.p>
            ) : displayedGuests.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-gray-500 dark:text-gray-400"
              >
                {searchTerm ? `No guests found matching "${searchTerm}".` : "No guests yet. Add the first! 🚀"}
              </motion.p>
            ) : (
              displayedGuests.map((g) => (
                <motion.li
                  key={g.id}
                  layout // Add layout prop for smoother animations on add/delete/reorder
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="p-2 rounded-xl border dark:border-zinc-700 shadow-sm flex justify-between items-center dark:bg-zinc-800"
                >
                  <div>
                    {editingId === g.id ? (
                      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center"> {/* Adjusted alignment */}
                        <input
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="px-2 py-1 border rounded dark:bg-zinc-700 dark:text-white w-full sm:w-auto" // Ensure input takes space
                          maxLength={50} // Match backend limit
                          autoFocus // Focus input on edit
                        />
                        <div className="flex gap-2 mt-2 sm:mt-0 flex-shrink-0"> {/* Prevent buttons wrapping */}
                          <button
                            onClick={() => updateGuest(g.id)}
                            disabled={loading}
                            className="text-green-500 hover:underline text-sm disabled:opacity-50"
                          >
                            {loading ? <FaSpinner className="animate-spin" /> : "Save"}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            disabled={loading}
                            className="text-gray-400 hover:underline text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-semibold dark:text-white break-words">{g.name}</h3> {/* Allow long names to wrap */}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {/* Safely access addedBy and format date */}
                          Added by {g.addedBy || 'Unknown'} •{' '}
                          {g.createdAt ? new Date(g.createdAt).toLocaleDateString() : 'Date unknown'}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Admin Actions */}
                  {isAdmin && editingId !== g.id && (
                    <div className="flex gap-2 ml-2 flex-shrink-0"> {/* Prevent buttons wrapping */}
                      <button
                        onClick={() => {
                          setEditingId(g.id);
                          setEditedName(g.name);
                        }}
                        className="text-blue-400 hover:underline text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteGuest(g.id)}
                        disabled={loading} // Disable delete during any loading state
                        className="text-red-400 hover:underline text-sm disabled:opacity-50"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 gap-2 overflow-x-auto pb-2"> {/* Added pb-2 for scrollbar space */}
            {/* Optional: Previous Button */}
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-full bg-gray-200 text-black dark:bg-zinc-700 dark:text-white disabled:opacity-50"
            >
              &lt; {/* Previous */}
            </button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, idx) => (
              <button
                key={idx + 1}
                onClick={() => setCurrentPage(idx + 1)}
                className={`px-4 py-2 rounded-full text-sm ${ // Made text slightly smaller
                  currentPage === idx + 1
                    ? "bg-teal-500 text-white font-semibold" // Highlight current page
                    : "bg-gray-200 text-black dark:bg-zinc-700 dark:text-white hover:bg-gray-300 dark:hover:bg-zinc-600"
                }`}
              >
                {idx + 1}
              </button>
            ))}

            {/* Optional: Next Button */}
            <button
               onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
               disabled={currentPage === totalPages}
               className="px-3 py-1 rounded-full bg-gray-200 text-black dark:bg-zinc-700 dark:text-white disabled:opacity-50"
            >
               &gt; {/* Next */}
             </button>
          </div>
        )}
      </div>
    </> // 4. Close the Fragment
  );
}