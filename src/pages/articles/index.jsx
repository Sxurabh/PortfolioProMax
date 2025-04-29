import Head from 'next/head';
import { Card } from '@/components/Card';
import { SimpleLayout } from '@/components/SimpleLayout';
import { formatDate } from '@/lib/formatDate';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { useSession } from 'next-auth/react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import clsx from 'clsx';
import { useState, useEffect } from 'react';

const PAGE_SIZE = 3; // Show 3 articles per page

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

function Article({ article, isAdmin, onDelete }) {
  const handleDelete = async () => {
    if (confirm('Delete this article permanently?')) {
      try {
        const response = await fetch(`/api/articles/${article.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          onDelete(); // Refresh page after delete
        } else {
          alert('Failed to delete article');
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('Error deleting article');
      }
    }
  };

  return (
    <article className="md:grid md:grid-cols-4 md:items-baseline relative group">
      <Card
        className="md:col-span-3 relative transition-transform transform hover:scale-[1.02] hover:shadow-lg"
      >
        {isAdmin && (
          <div
            className={clsx(
              'absolute right-0 top-0 -translate-y-1/2 bg-white dark:bg-zinc-800 p-1 rounded-lg shadow-md z-30 pointer-events-auto',
              'sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity sm:duration-200', // Hover effect on desktop
              'opacity-100', // Always visible on mobile
            )}
          >
            <Link
              href={`/admin/articles/edit/${article.id}`}
              className="text-teal-500 hover:text-teal-600 mr-2 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded"
              title="Edit"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Edit article: ${article.title}`}
            >
              ✏️
            </Link>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="text-red-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
              title="Delete"
              aria-label={`Delete article: ${article.title}`}
            >
              🗑️
            </button>
          </div>
        )}
        <Card.Title href={`/articles/${article.slug}`}>
          {article.title}
        </Card.Title>
        <Card.Eyebrow
          as="time"
          dateTime={article.createdAt}
          className="md:hidden"
          decorate
        >
          {formatDate(article.createdAt)}
        </Card.Eyebrow>
        <Card.Description>{article.description}</Card.Description>
        <Card.Cta>Read article</Card.Cta>
      </Card>
      <Card.Eyebrow
        as="time"
        dateTime={article.createdAt}
        className="mt-1 hidden md:block"
      >
        {formatDate(article.createdAt)}
      </Card.Eyebrow>
    </article>
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

export default function ArticlesIndex({ articles, totalPages, currentPage }) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const [isLoading, setIsLoading] = useState(true);

  const refreshPage = () => {
    window.location.reload();
  };

  useEffect(() => {
    // Simulate loading state (since getServerSideProps fetches data server-side, this is for UX)
    setIsLoading(false);
  }, []);

  return (
    <>
      <Head>
        <title>Articles - Saurabh Kirve</title>
        <meta
          name="description"
          content="All my long-form thoughts collected here."
        />
      </Head>

      <SimpleLayout
        title="Writing on tech and design"
        intro="All articles in chronological order."
      >
        {isAdmin && (
          <div className="mb-10">
            <Link
              href="/articles/write"
              className="inline-block rounded-xl bg-teal-500 px-4 py-2 text-white hover:bg-teal-600 transition focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              Write New Article
            </Link>
          </div>
        )}

        <div className="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
          <div className="flex max-w-3xl flex-col space-y-16">
            {isLoading ? (
              Array.from({ length: PAGE_SIZE }, (_, idx) => (
                <div
                  key={idx}
                  className="md:grid md:grid-cols-4 md:items-baseline animate-pulse"
                >
                  <div className="md:col-span-3 rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40">
                    <div className="h-6 w-3/4 bg-zinc-200 dark:bg-zinc-700 rounded mb-4" />
                    <div className="h-4 w-1/4 bg-zinc-200 dark:bg-zinc-700 rounded mb-2" />
                    <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-700 rounded mb-2" />
                    <div className="h-4 w-5/6 bg-zinc-200 dark:bg-zinc-700 rounded" />
                  </div>
                  <div className="hidden md:block mt-1 h-4 w-1/4 bg-zinc-200 dark:bg-zinc-700 rounded" />
                </div>
              ))
            ) : articles.length === 0 ? (
              <div className="text-center text-zinc-600 dark:text-zinc-400">
                <p className="text-lg font-semibold">No Articles Found</p>
                <p className="mt-2">Check back later for new articles!</p>
              </div>
            ) : (
              articles.map((article) => (
                <Article
                  key={article.slug}
                  article={article}
                  isAdmin={isAdmin}
                  onDelete={refreshPage}
                />
              ))
            )}
          </div>
        </div>

        {/* Enhanced Pagination */}
        <div className="flex justify-center mt-12 space-x-2 items-center">
          {currentPage > 1 && (
            <Link
              href={`/articles?page=${currentPage - 1}`}
              className="flex items-center px-3 py-2 rounded-lg text-sm bg-zinc-200 dark:bg-zinc-700 hover:bg-teal-100 dark:hover:bg-teal-700 transition text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label="Previous page"
            >
              <ChevronLeftIcon className="h-4 w-4 mr-1 stroke-current" />
              Prev
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, idx) => (
            <Link
              key={idx}
              href={`/articles?page=${idx + 1}`}
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
            </Link>
          ))}
          {currentPage < totalPages && (
            <Link
              href={`/articles?page=${currentPage + 1}`}
              className="flex items-center px-3 py-2 rounded-lg text-sm bg-zinc-200 dark:bg-zinc-700 hover:bg-teal-100 dark:hover:bg-teal-700 transition text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label="Next page"
            >
              Next
              <ChevronRightIcon className="h-4 w-4 ml-1 stroke-current" />
            </Link>
          )}
        </div>
      </SimpleLayout>

      <ScrollToTopButton />
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);

  const page = parseInt(context.query.page) || 1;
  const skip = (page - 1) * PAGE_SIZE;

  try {
    const [dbArticlesRaw, totalArticles] = await Promise.all([
      prisma.article.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: PAGE_SIZE,
      }),
      prisma.article.count(),
    ]);

    const articles = dbArticlesRaw.map((article) => ({
      ...article,
      createdAt: article.createdAt.toISOString(),
      slug: article.slug || article.id,
    }));

    const totalPages = Math.ceil(totalArticles / PAGE_SIZE);

    return {
      props: { session, articles, totalPages, currentPage: page },
    };
  } catch (error) {
    console.error('Error in getServerSideProps on articles page:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return {
      props: {
        session,
        articles: [],
        totalPages: 1,
        currentPage: 1,
      },
    };
  }
}