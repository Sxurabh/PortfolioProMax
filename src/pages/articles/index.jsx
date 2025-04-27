// pages/articles/index.jsx

import Head from 'next/head'
import { Card } from '@/components/Card'
import { SimpleLayout } from '@/components/SimpleLayout'
import { formatDate } from '@/lib/formatDate'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { useSession } from "next-auth/react"
import prisma from '@/lib/prisma'
import Link from 'next/link'

const PAGE_SIZE = 3; // Show 3 articles per page

function Article({ article, isAdmin, onDelete }) {
  const handleDelete = async () => {
    if (confirm("Delete this article permanently?")) {
      try {
        const response = await fetch(`/api/articles/${article.id}`, {
          method: 'DELETE'
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
      <Card className="md:col-span-3 relative">
        {isAdmin && (
          <div className="absolute right-0 top-0 -translate-y-1/2 bg-white dark:bg-zinc-800 p-1 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30 pointer-events-auto">
            <Link
              href={`/admin/articles/edit/${article.id}`}
              className="text-teal-500 hover:text-teal-600 mr-2"
              title="Edit"
              onClick={(e) => e.stopPropagation()}
            >
              ✏️
            </Link>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="text-red-500 hover:text-red-600"
              title="Delete"
            >
              🗑️
            </button>
          </div>
        )}
        <Card.Title href={`/articles/${article.slug}`}>
          {article.title}
        </Card.Title>
        <Card.Eyebrow as="time" dateTime={article.createdAt} className="md:hidden" decorate>
          {formatDate(article.createdAt)}
        </Card.Eyebrow>
        <Card.Description>{article.description}</Card.Description>
        <Card.Cta>Read article</Card.Cta>
      </Card>
      <Card.Eyebrow as="time" dateTime={article.createdAt} className="mt-1 hidden md:block">
        {formatDate(article.createdAt)}
      </Card.Eyebrow>
    </article>
  )
}

export default function ArticlesIndex({ articles, totalPages, currentPage }) {
  const { data: session } = useSession()
  const isAdmin = session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL

  const refreshPage = () => {
    window.location.reload();
  }

  return (
    <>
      <Head>
        <title>Articles - Saurabh Kirve</title>
        <meta name="description" content="All my long-form thoughts collected here." />
      </Head>

      <SimpleLayout title="Writing on tech and design" intro="All articles in chronological order.">
        {isAdmin && (
          <div className="mb-10">
            <Link
              href="/articles/write"
              className="inline-block rounded-xl bg-teal-500 px-4 py-2 text-white hover:bg-teal-600 transition"
            >
              Write New Article
            </Link>
          </div>
        )}

        <div className="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
          <div className="flex max-w-3xl flex-col space-y-16">
            {articles.map((article) => (
              <Article 
                key={article.slug} 
                article={article}
                isAdmin={isAdmin}
                onDelete={refreshPage}
              />
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-12 space-x-2 items-center">
          {/* Previous Button */}
          {currentPage > 1 && (
            <Link
              href={`/articles?page=${currentPage - 1}`}
              className="px-3 py-2 rounded-lg text-sm bg-zinc-200 dark:bg-zinc-700 hover:bg-teal-100 dark:hover:bg-teal-700 transition text-black dark:text-white"
            >
              ← Prev
            </Link>
          )}

          {/* Page Numbers */}
          {Array.from({ length: totalPages }, (_, idx) => (
            <Link
              key={idx}
              href={`/articles?page=${idx + 1}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                currentPage === idx + 1
                  ? 'bg-teal-500 text-white'
                  : 'bg-zinc-200 dark:bg-zinc-700 hover:bg-teal-100 dark:hover:bg-teal-700 text-black dark:text-white'
              }`}
            >
              {idx + 1}
            </Link>
          ))}

          {/* Next Button */}
          {currentPage < totalPages && (
            <Link
              href={`/articles?page=${currentPage + 1}`}
              className="px-3 py-2 rounded-lg text-sm bg-zinc-200 dark:bg-zinc-700 hover:bg-teal-100 dark:hover:bg-teal-700 transition text-black dark:text-white"
            >
              Next →
            </Link>
          )}
        </div>
      </SimpleLayout>
    </>
  )
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions)

  const page = parseInt(context.query.page) || 1;
  const skip = (page - 1) * PAGE_SIZE;

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
    slug: article.slug || article.id
  }));

  const totalPages = Math.ceil(totalArticles / PAGE_SIZE);

  return {
    props: { session, articles, totalPages, currentPage: page },
  }
}
