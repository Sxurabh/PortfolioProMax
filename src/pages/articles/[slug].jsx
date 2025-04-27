// pages/articles/[slug].jsx

import Head from 'next/head'
import { SimpleLayout } from '@/components/SimpleLayout'
import prisma from '@/lib/prisma'
import { formatDate } from '@/lib/formatDate'
import Link from 'next/link'
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { toast } from 'react-hot-toast'

export default function ArticlePage({ article }) {
  const { data: session } = useSession()
  const router = useRouter()

  const isAdmin = session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this article?')) {
      try {
        const response = await fetch(`/api/articles/${article.id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          toast.success('Article deleted successfully')
          router.push('/articles')
        } else {
          toast.error('Failed to delete article')
        }
      } catch (error) {
        console.error('Delete error:', error)
        toast.error('Error deleting article')
      }
    }
  }

  if (!article) {
    return <div className="text-center mt-20">Article not found.</div>
  }

  return (
    <>
      <Head>
        <title>{article.title} - Your Name</title>
        <meta name="description" content={article.description} />

        {/* Open Graph for social sharing */}
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.description} />
        <meta property="og:type" content="article" />
      </Head>

      <SimpleLayout
        title={article.title}
        intro={article.description}
      >
        <div className="max-w-3xl mx-auto space-y-8 text-base text-zinc-600 dark:text-zinc-400">

          {/* Top Buttons */}
          <div className="flex justify-between items-center mb-6">
            <Link href="/articles" className="inline-flex items-center text-sm text-teal-500 hover:text-teal-600 transition">
              ← Back to Articles
            </Link>

            {isAdmin && (
              <div className="flex items-center space-x-4">
                <Link
                  href={`/admin/articles/edit/${article.id}`}
                  className="text-sm text-blue-500 hover:text-blue-600 transition"
                  title="Edit Article"
                >
                  ✏️ Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="text-sm text-red-500 hover:text-red-600 transition"
                  title="Delete Article"
                >
                  🗑️ Delete
                </button>
              </div>
            )}
          </div>

          {/* Date */}
          <time className="block text-sm text-zinc-400 dark:text-zinc-500">
            {formatDate(article.createdAt)}
          </time>

          {/* Content */}
          <div className="prose prose-zinc dark:prose-invert mt-6">
            {article.content ? (
              <p>{article.content}</p>
            ) : (
              <p className="italic text-zinc-400">No content available. Coming soon!</p>
            )}
          </div>

        </div>
      </SimpleLayout>
    </>
  )
}

// Server-side fetching
export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions)

  const { slug } = context.params

  const article = await prisma.article.findFirst({
    where: { slug },
  })

  if (!article) {
    return { notFound: true }
  }

  return {
    props: {
      session,
      article: {
        ...article,
        createdAt: article.createdAt.toISOString(),
      },
    },
  }
}
