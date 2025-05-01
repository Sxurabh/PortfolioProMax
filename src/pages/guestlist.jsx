import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { toast, Toaster } from "react-hot-toast";
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
  const [isHydrated, setIsHydrated] = useState(false);

  // Infinite scroll state
  const [visibleGuests, setVisibleGuests] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const guestsPerLoad = 10; // Number of guests to load per scroll
  const observerRef = useRef(null);

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

  // Debug logs for session, guests, and hydration
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
        setGuests((prev) => [data, ...prev]);
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
        setGuests((prev) => prev.filter((g) => g.id !== id));
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
        setGuests((prev) =>
          prev.map((g) => (g.id === id ? { ...g, name: updated.name } : g))
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

  // Memoize filteredGuests to prevent unnecessary re-renders
  const filteredGuests = useMemo(() => {
    return guests.filter((g) =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [guests, searchTerm]);

  // Reset visible guests when filteredGuests changes
  useEffect(() => {
    console.log('Filtered Guests:', filteredGuests);
    const initialGuests = filteredGuests.slice(0, guestsPerLoad);
    setVisibleGuests(initialGuests);
    setHasMore(filteredGuests.length > initialGuests.length);
    setIsLoadingMore(false);
    if (observerRef.current) observerRef.current.disconnect();
    console.log('Initial Visible Guests:', initialGuests);
    console.log('Has More After Reset:', filteredGuests.length > initialGuests.length);
  }, [filteredGuests, guestsPerLoad]);

  // Intersection Observer to load more guests
  const lastGuestRef = useCallback(
    (node) => {
      if (isLoadingMore || fetchingGuests || fetchError || !hasMore) {
        console.log('Observer Skipped - isLoadingMore:', isLoadingMore, 'fetchingGuests:', fetchingGuests, 'fetchError:', fetchError, 'hasMore:', hasMore);
        return;
      }

      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          console.log('Intersection Observer Triggered - Loading more guests...');
          console.log('Current Visible Guests Length:', visibleGuests.length);
          console.log('Total Filtered Guests:', filteredGuests.length);

          setIsLoadingMore(true);
          setTimeout(() => {
            const nextGuests = filteredGuests.slice(0, visibleGuests.length + guestsPerLoad);
            console.log('Next Guests to Load:', nextGuests);
            setVisibleGuests(nextGuests);
            const newHasMore = nextGuests.length < filteredGuests.length;
            setHasMore(newHasMore);
            setIsLoadingMore(false);

            console.log('Updated Visible Guests Length:', nextGuests.length);
            console.log('Has More After Load:', newHasMore);

            // Disconnect observer if no more guests to load
            if (!newHasMore && observerRef.current) {
              console.log('No more guests to load - Disconnecting observer');
              observerRef.current.disconnect();
            }
          }, 500); // Simulate loading delay
        }
      }, { threshold: 0.1 });

      if (node) observerRef.current.observe(node);
    },
    [isLoadingMore, hasMore, visibleGuests, filteredGuests, fetchingGuests, fetchError, guestsPerLoad]
  );

  // Debug logs for visible guests and hasMore
  useEffect(() => {
    console.log('Visible Guests:', visibleGuests);
    console.log('Has More:', hasMore);
  }, [visibleGuests, hasMore]);

  // Scroll to Top Button and Icons
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
          'fixed bottom-6 right-6 p-3 rounded-full bg-teal-600 text-white shadow-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 transition-all duration-300',
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none',
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
        <div className="min-h-screen flex flex-col justify-center items-center p-8 text-center bg-zinc-50 dark:bg-zinc-900">
          <div className="animate-spin inline-block">
            <FaSpinner className="text-teal-600 text-4xl" />
          </div>
          <p className="mt-4 text-lg font-medium text-zinc-600 dark:text-zinc-300">Loading...</p>
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
        <div className="min-h-screen flex flex-col justify-center items-center gap-8 px-6 py-12 bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800">
          <Toaster />
          <h1 className="text-4xl sm:text-5xl font-bold text-center text-zinc-900 dark:text-zinc-100 leading-tight max-w-md">
            Be My Guest<br />Add Your Name to the List!
          </h1>
          <button
            onClick={() => signIn()}
            className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-xl shadow-lg hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 max-w-xs w-full"
          >
            Sign In with GitHub/Google
          </button>
        </div>
      </>
    );
  }

  // If session is still loading or session is not defined, show loading state with initialGuests
  if (status === "loading" || !session) {
    return (
      <>
        <Head>
          <title>Guest List - Manage Entries</title>
          <meta name="description" content="Manage the guest list entries" />
        </Head>

        <div className="max-w-2xl mx-auto p-6 sm:p-8 bg-zinc-50 dark:bg-zinc-900 min-h-screen">
          <Toaster />

          {/* Placeholder Avatar Section */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            </div>
          </div>

          {/* Add Form (Disabled During Loading) */}
          <form className="flex flex-col sm:flex-row gap-4 mb-8">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="flex-1 px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 shadow-sm"
              maxLength={50}
              disabled
            />
            <button
              type="submit"
              disabled
              className="px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold opacity-50 cursor-not-allowed shadow-sm"
            >
              Add
            </button>
          </form>

          {/* Search (Disabled During Loading) */}
          <input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
            placeholder="Search guests..."
            className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 mb-8 shadow-sm"
            disabled
          />

          {/* Guest Count */}
          <p className="mb-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Total Guests: {filteredGuests.length}
          </p>

          {/* Guest List with Initial Data */}
          <div className="max-h-[50vh] overflow-y-auto mb-8 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <ul className="space-y-4 p-4">
              {filteredGuests.length === 0 ? (
                <p className="text-center text-zinc-600 dark:text-zinc-400 font-medium">
                  {searchTerm ? `No guests found matching "${searchTerm}".` : "No guests yet. Add the first! 🚀"}
                </p>
              ) : (
                filteredGuests.slice(0, guestsPerLoad).map((g) => (
                  <li
                    key={g.id}
                    className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex justify-between items-center shadow-sm hover:shadow-md transition-all duration-300 opacity-100"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 break-words">{g.name}</h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Added by {g.addedBy || 'Unknown'} •{' '}
                        {g.createdAt ? new Date(g.createdAt).toLocaleDateString() : 'Date unknown'}
                      </p>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
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

      <div className="max-w-2xl mx-auto p-6 sm:p-8 bg-zinc-50 dark:bg-zinc-900 min-h-screen">
        <Toaster />

        {/* Avatar Section */}
        <div className="flex items-center gap-4 mb-8">
          <img
            src={session?.user?.image || '/default-avatar.png'}
            alt={`${session?.user?.name || 'User'}'s avatar`}
            className="w-14 h-14 rounded-full border border-zinc-200 dark:border-zinc-700 shadow-sm transition-transform duration-300 hover:scale-105"
          />
          <div>
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{session?.user?.name || 'User'}</h2>
            <button
              onClick={() => signOut()}
              className="text-sm text-teal-600 dark:text-teal-400 hover:underline focus:outline-none focus:ring-2 focus:ring-teal-500 rounded transition-colors duration-300"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Add Form */}
        <form onSubmit={addGuest} className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="flex-1 px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 shadow-sm hover:shadow-md"
            maxLength={50}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 shadow-sm"
          >
            {loading ? <FaSpinner className="animate-spin text-xl" /> : "Add"}
          </button>
        </form>

        {/* Search */}
        <input
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
          placeholder="Search guests..."
          className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 mb-8 shadow-sm hover:shadow-md"
        />

        {/* Guest Count */}
        <p className="mb-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Total Guests: {filteredGuests.length}
        </p>

        {/* Guest List with Infinite Scroll */}
        <div className="max-h-[50vh] overflow-y-auto mb-8 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <ul className="space-y-4 p-4">
            {fetchError ? (
              <div className="text-center text-zinc-600 dark:text-zinc-400">
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
                  className="mt-4 px-6 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm transition-all duration-300 transform hover:scale-105"
                >
                  Retry
                </button>
              </div>
            ) : fetchingGuests ? (
              Array.from({ length: guestsPerLoad }).map((_, idx) => (
                <li
                  key={idx}
                  className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex justify-between items-center shadow-sm animate-pulse"
                >
                  <div className="flex-1">
                    <div className="h-5 w-3/4 bg-zinc-200 dark:bg-zinc-700 rounded mb-2" />
                    <div className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-700 rounded" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-5 w-5 bg-zinc-200 dark:bg-zinc-700 rounded" />
                    <div className="h-5 w-5 bg-zinc-200 dark:bg-zinc-700 rounded" />
                  </div>
                </li>
              ))
            ) : visibleGuests.length === 0 ? (
              <p className="text-center text-zinc-600 dark:text-zinc-400 font-medium">
                {searchTerm ? `No guests found matching "${searchTerm}".` : "No guests yet. Add the first! 🚀"}
              </p>
            ) : (
              visibleGuests.map((g, index) => (
                <li
                  key={g.id}
                  ref={index === visibleGuests.length - 1 ? lastGuestRef : null}
                  className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex justify-between items-center shadow-sm hover:shadow-md transition-all duration-300 group opacity-100"
                >
                  <div className="flex-1">
                    {editingId === g.id ? (
                      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                        <input
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 w-full sm:w-auto shadow-sm hover:shadow-md"
                          maxLength={50}
                          autoFocus
                        />
                        <div className="flex gap-2 mt-2 sm:mt-0 flex-shrink-0">
                          <button
                            onClick={() => updateGuest(g.id)}
                            disabled={loading}
                            className="text-teal-600 dark:text-teal-400 hover:underline text-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded transition-colors duration-300"
                          >
                            {loading ? <FaSpinner className="animate-spin" /> : "Save"}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            disabled={loading}
                            className="text-zinc-500 dark:text-zinc-400 hover:underline text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 rounded transition-colors duration-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 break-words">{g.name}</h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
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
                        className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition-colors duration-300"
                        aria-label={`Edit guest: ${g.name}`}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteGuest(g.id)}
                        disabled={loading}
                        className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 rounded disabled:opacity-50 transition-colors duration-300"
                        aria-label={`Delete guest: ${g.name}`}
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </li>
              ))
            )}
            {isLoadingMore && hasMore && (
              <div className="flex justify-center py-4">
                <FaSpinner className="animate-spin text-teal-600 text-2xl" />
              </div>
            )}
          </ul>
        </div>
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