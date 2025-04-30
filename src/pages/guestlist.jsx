import { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { toast, Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { FaSpinner } from "react-icons/fa";
import Head from 'next/head';
import clsx from 'clsx';

export default function GuestlistPage({ initialGuests, isAuthenticated }) {
  const { data: session, status } = useSession();
  const [guests, setGuests] = useState(initialGuests || []);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingGuests, setFetchingGuests] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isHydrated, setIsHydrated] = useState(false);
  const guestsPerPage = 5;

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isAdmin = session?.user?.email === adminEmail;

  // Ensure hydration is complete before rendering client-side
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Fetch guests client-side only if necessary
  useEffect(() => {
    if (!session || !isHydrated) return;
    const fetchGuests = async () => {
      setFetchingGuests(true);
      setFetchError(null);
      try {
        const res = await fetch("/api/guestlist-test", { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch guest list');
        const data = await res.json();
        console.log('API Response:', data);
        setGuests(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Fetch error:', error);
        setFetchError(error.message);
        toast.error("Failed to fetch guest list");
      } finally {
        setFetchingGuests(false);
      }
    };
    fetchGuests();
  }, [session, isHydrated]);

  // Debug logs
  useEffect(() => {
    console.log('Session:', session, 'Status:', status);
    console.log('Guests:', guests);
    console.log('Is Hydrated:', isHydrated);
  }, [session, status, guests, isHydrated]);

  const addGuest = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Please enter a name");

    setLoading(true);
    try {
      const res = await fetch("/api/guestlist-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim().slice(0, 50) }),
        credentials: 'include',
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
        credentials: 'include',
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
        credentials: 'include',
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

  useEffect(() => {
    console.log('Filtered Guests:', filteredGuests);
    console.log('Displayed Guests:', displayedGuests);
  }, [filteredGuests, displayedGuests]);

  // Scroll to Top Button and Icons
  function ChevronLeftIcon(props) {
    return (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
        <path
          d="M10.25 4.75 6.75 8l3.5 3.25"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  function ChevronRightIcon(props) {
    return (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
        <path
          d="M5.75 4.75 9.25 8l-3.5 3.25"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  function ArrowUpIcon(props) {
    return (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
        <path
          d="M8 12.25V3.75M3.75 8l4.25-4.25L12.25 8"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  function ScrollToTopButton() {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    };

    useEffect(() => {
      window.addEventListener('scroll', toggleVisibility);
      return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    return (
      <button
        onClick={scrollToTop}
        className={clsx(
          'fixed bottom-6 right-6 p-3 rounded-full bg-teal-500 text-white shadow-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-800 transition-opacity duration-300',
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        aria-label="Scroll to top"
      >
        <ArrowUpIcon className="h-5 w-5" />
      </button>
    );
  }

  // Conditional Rendering
  // Prevent rendering until hydration is complete
  if (!isHydrated) {
    return (
      <>
        <Head>
          <title>Loading Guest List...</title>
        </Head>
        <div className="min-h-screen flex justify-center items-center p-8 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="inline-block"
          >
            <FaSpinner className="text-teal-500 text-3xl" />
          </motion.div>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
      </>
    );
  }

  // Unauthenticated View
  if (!isAuthenticated && status === "unauthenticated") {
    return (
      <>
        <Head>
          <title>Guestlist - Saurabh Kirve</title>
          <meta name="description" content="Sign in to add your name to the guest list." />
        </Head>
        <div className="min-h-screen flex flex-col justify-center items-center gap-6 px-6 py-12 bg-zinc-50 dark:bg-zinc-900">
          <Toaster />
          <h1
            className="text-3xl sm:text-5xl font-bold text-center text-zinc-900 dark:text-white"
          >
            Be my guest
            <br />
            and add your name to the list!
          </h1>
          <button
            onClick={() => signIn()}
            className="px-6 py-3 bg-zinc-800 text-white dark:bg-zinc-700 rounded-xl dark:hover:bg-teal-500 hover:bg-teal-500 hover:scale-105 transition transform focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            Sign in with GitHub or Google
          </button>
        </div>
      </>
    );
  }

  // If session is still loading but server confirmed authentication, use initialGuests
  if (status === "loading" || !session) {
    return (
      <>
        <Head>
          <title>Guest List - Manage Entries</title>
          <meta name="description" content="Manage the guest list entries" />
        </Head>

        <div className="max-w-2xl mx-auto p-4 sm:p-6">
          <Toaster />

          {/* Placeholder Avatar Section (since session is loading) */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full border dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
            <div>
              <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-700 rounded mb-2 animate-pulse" />
              <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
            </div>
          </div>

          {/* Add Form (Disabled During Loading) */}
          <form className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="flex-1 px-4 py-2 border rounded-xl bg-white shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-teal-400 dark:focus:ring-teal-400/10"
              maxLength={50}
              disabled
            />
            <button
              type="submit"
              disabled
              className="flex items-center justify-center px-4 py-2 bg-teal-500 text-white rounded-xl opacity-50"
            >
              Add
            </button>
          </form>

          {/* Search (Disabled During Loading) */}
          <input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search guests..."
            className="mb-6 w-full px-4 py-2 border rounded-xl bg-white shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-teal-400 dark:focus:ring-teal-400/10"
            disabled
          />

          {/* Guest Count */}
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            Total Guests: {filteredGuests.length}
          </p>

          {/* Guest List with Initial Data */}
          <div className="max-h-[50vh] overflow-y-auto mb-6">
            <ul className="space-y-4">
              <AnimatePresence>
                {filteredGuests.length === 0 ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center text-zinc-600 dark:text-zinc-400"
                  >
                    {searchTerm ? `No guests found matching "${searchTerm}".` : "No guests yet. Add the first! 🚀"}
                  </motion.p>
                ) : (
                  displayedGuests.map((g) => (
                    <li
                      key={g.id}
                      className="p-2 rounded-xl border dark:border-zinc-700 shadow-sm flex justify-between items-center dark:bg-zinc-800 group opacity-100"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold dark:text-white break-words">{g.name}</h3>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">
                          Added by {g.addedBy || 'Unknown'} •{' '}
                          {g.createdAt ? new Date(g.createdAt).toLocaleDateString() : 'Date unknown'}
                        </p>
                      </div>
                    </li>
                  ))
                )}
              </AnimatePresence>
            </ul>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center px-3 py-2 rounded-lg text-sm bg-zinc-200 dark:bg-zinc-700 hover:bg-teal-100 dark:hover:bg-teal-700 text-black dark:text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                aria-label="Previous page"
              >
                <ChevronLeftIcon className="h-4 w-4 mr-1 stroke-current" />
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, idx) => (
                <button
                  key={idx + 1}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={clsx(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500',
                    currentPage === idx + 1
                      ? 'bg-teal-500 text-white shadow-md'
                      : 'bg-zinc-200 dark:bg-zinc-700 hover:bg-teal-100 dark:hover:bg-teal-700 text-black dark:text-white',
                  )}
                  aria-label={`Go to page ${idx + 1}`}
                  aria-current={currentPage === idx + 1 ? 'page' : undefined}
                >
                  {idx + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center px-3 py-2 rounded-lg text-sm bg-zinc-200 dark:bg-zinc-700 hover:bg-teal-100 dark:hover:bg-teal-700 text-black dark:text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                aria-label="Next page"
              >
                Next
                <ChevronRightIcon className="h-4 w-4 ml-1 stroke-current" />
              </button>
            </div>
          )}
        </div>

        <ScrollToTopButton />
      </>
    );
  }

  // Main Authenticated View (when session is loaded and defined)
  return (
    <>
      <Head>
        <title>Guest List - Manage Entries</title>
        <meta name="description" content="Manage the guest list entries" />
      </Head>

      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <Toaster />

        {/* Avatar Section */}
        <div className="flex items-center gap-4 mb-6">
          <img
            src={session?.user?.image || '/default-avatar.png'}
            alt={`${session?.user?.name || 'User'}'s avatar`}
            className="w-14 h-14 rounded-full border dark:border-zinc-700"
          />
          <div>
            <h2 className="text-2xl font-semibold dark:text-white">{session?.user?.name || 'User'}</h2>
            <button
              onClick={() => signOut()}
              className="text-sm text-teal-500 hover:underline focus:outline-none focus:ring-2 focus:ring-teal-500 rounded"
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
            className="flex-1 px-4 py-2 border rounded-xl bg-white shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-teal-400 dark:focus:ring-teal-400/10"
            maxLength={50}
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl transition transform hover:scale-105 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {loading ? <FaSpinner className="animate-spin" /> : "Add"}
          </button>
        </form>

        {/* Search */}
        <input
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search guests..."
          className="mb-6 w-full px-4 py-2 border rounded-xl bg-white shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-teal-400 dark:focus:ring-teal-400/10"
        />

        {/* Guest Count */}
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          Total Guests: {filteredGuests.length}
        </p>

        {/* Guest List */}
        <div className="max-h-[50vh] overflow-y-auto mb-6">
          <ul className="space-y-4">
            <AnimatePresence>
              {fetchError ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-zinc-600 dark:text-zinc-400"
                >
                  <p className="text-lg font-semibold">Failed to Load Guest List</p>
                  <p className="mt-2">{fetchError}</p>
                  <button
                    onClick={() => {
                      setFetchingGuests(true);
                      setFetchError(null);
                      fetch("/api/guestlist-test", { credentials: 'include' })
                        .then((res) => res.json())
                        .then((data) => setGuests(Array.isArray(data) ? data : []))
                        .catch((error) => {
                          setFetchError(error.message);
                          toast.error("Failed to fetch guest list");
                        })
                        .finally(() => setFetchingGuests(false));
                    }}
                    className="mt-4 px-4 py-2 rounded-xl bg-teal-500 text-white hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    Retry
                  </button>
                </motion.div>
              ) : fetchingGuests ? (
                Array.from({ length: guestsPerPage }).map((_, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-2 rounded-xl border dark:border-zinc-700 shadow-sm flex justify-between items-center dark:bg-zinc-800 animate-pulse"
                  >
                    <div className="flex-1">
                      <div className="h-5 w-3/4 bg-zinc-200 dark:bg-zinc-700 rounded mb-2" />
                      <div className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-700 rounded" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-5 w-5 bg-zinc-200 dark:bg-zinc-700 rounded" />
                      <div className="h-5 w-5 bg-zinc-200 dark:bg-zinc-700 rounded" />
                    </div>
                  </motion.li>
                ))
              ) : displayedGuests.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-zinc-600 dark:text-zinc-400"
                >
                  {searchTerm ? `No guests found matching "${searchTerm}".` : "No guests yet. Add the first! 🚀"}
                </motion.p>
              ) : (
                displayedGuests.map((g) => (
                  <li
                    key={g.id}
                    className="p-2 rounded-xl border dark:border-zinc-700 shadow-sm flex justify-between items-center dark:bg-zinc-800 group opacity-100"
                  >
                    <div className="flex-1">
                      {editingId === g.id ? (
                        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                          <input
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="px-2 py-1 border rounded bg-white shadow-md shadow-zinc-800/5 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10 dark:border-zinc-700 dark:bg-zinc-700 dark:text-zinc-200 dark:focus:border-teal-400 dark:focus:ring-teal-400/10 w-full sm:w-auto"
                            maxLength={50}
                            autoFocus
                          />
                          <div className="flex gap-2 mt-2 sm:mt-0 flex-shrink-0">
                            <button
                              onClick={() => updateGuest(g.id)}
                              disabled={loading}
                              className="text-green-500 hover:underline text-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
                            >
                              {loading ? <FaSpinner className="animate-spin" /> : "Save"}
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              disabled={loading}
                              className="text-gray-400 hover:underline text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className="font-semibold dark:text-white break-words">{g.name}</h3>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">
                            Added by {g.addedBy || 'Unknown'} •{' '}
                            {g.createdAt ? new Date(g.createdAt).toLocaleDateString() : 'Date unknown'}
                          </p>
                        </>
                      )}
                    </div>

                    {/* Admin Actions */}
                    {isAdmin && editingId !== g.id && (
                      <div
                        className={clsx(
                          'flex gap-2 ml-2 flex-shrink-0',
                          'sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity sm:duration-200',
                          'opacity-100'
                        )}
                      >
                        <button
                          onClick={() => {
                            setEditingId(g.id);
                            setEditedName(g.name);
                          }}
                          className="text-blue-400 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                          aria-label={`Edit guest: ${g.name}`}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteGuest(g.id)}
                          disabled={loading}
                          className="text-red-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 rounded disabled:opacity-50"
                          aria-label={`Delete guest: ${g.name}`}
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </li>
                ))
              )}
            </AnimatePresence>
          </ul>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 gap-2 overflow-x-auto pb-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center px-3 py-2 rounded-lg text-sm bg-zinc-200 dark:bg-zinc-700 hover:bg-teal-100 dark:hover:bg-teal-700 text-black dark:text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label="Previous page"
            >
              <ChevronLeftIcon className="h-4 w-4 mr-1 stroke-current" />
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, idx) => (
              <button
                key={idx + 1}
                onClick={() => setCurrentPage(idx + 1)}
                className={clsx(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500',
                  currentPage === idx + 1
                    ? 'bg-teal-500 text-white shadow-md'
                    : 'bg-zinc-200 dark:bg-zinc-700 hover:bg-teal-100 dark:hover:bg-teal-700 text-black dark:text-white',
                )}
                aria-label={`Go to page ${idx + 1}`}
                aria-current={currentPage === idx + 1 ? 'page' : undefined}
              >
                {idx + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center px-3 py-2 rounded-lg text-sm bg-zinc-200 dark:bg-zinc-700 hover:bg-teal-100 dark:hover:bg-teal-700 text-black dark:text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label="Next page"
            >
              Next
              <ChevronRightIcon className="h-4 w-4 ml-1 stroke-current" />
            </button>
          </div>
        )}
      </div>

      <ScrollToTopButton />
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);

  let initialGuests = [];
  if (session) {
    try {
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
      const host = context.req.headers.host || 'localhost:3000';
      const baseUrl = `${protocol}://${host}`;
      const res = await fetch(`${baseUrl}/api/guestlist-test`, {
        headers: {
          cookie: context.req.headers.cookie || '',
        },
      });
      if (res.ok) {
        initialGuests = await res.json();
        if (!Array.isArray(initialGuests)) initialGuests = [];
      }
    } catch (error) {
      console.error('SSR Fetch Error:', error);
    }
  }

  return {
    props: {
      initialGuests,
      isAuthenticated: !!session,
    },
  };
}