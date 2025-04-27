// src/pages/admin/articles/edit/[id].jsx

import { useState } from 'react'
import { useRouter } from 'next/router'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { SimpleLayout } from '@/components/SimpleLayout'

export default function EditArticle({ article }) {
  const router = useRouter()
  const [title, setTitle] = useState(article.title)
  const [description, setDescription] = useState(article.description)
  const [content, setContent] = useState(article.content)

  const handleSubmit = async (e) => {
    e.preventDefault()

    const response = await fetch(`/api/articles/${article.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, content }),
    })

    if (response.ok) {
      router.push(`/articles/${article.slug}`)
    } else {
      alert('Failed to update article')
    }
  }

  return (
    <SimpleLayout
      title="Edit Article"
      intro="Update your article below."
    >
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="rounded border border-zinc-300 dark:border-zinc-700 p-2 dark:bg-zinc-800"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="rounded border border-zinc-300 dark:border-zinc-700 p-2 dark:bg-zinc-800"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="rounded border border-zinc-300 dark:border-zinc-700 p-2 dark:bg-zinc-800"
          />
        </div>

        <button
          type="submit"
          className="bg-teal-500 hover:bg-teal-600 text-white py-2 px-4 rounded transition"
        >
          Save Changes
        </button>
      </form>
    </SimpleLayout>
  )
}

export async function getServerSideProps(context) {
    const session = await getServerSession(context.req, context.res, authOptions)
  
    if (!session || session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return { redirect: { destination: '/', permanent: false } }
    }
  
    const id = Number(context.params.id)  // 👈 fix here
  
    const article = await prisma.article.findUnique({
      where: { id },
    })
  
    if (!article) {
      return { notFound: true }
    }
  
    return {
      props: {
        session,
        article: JSON.parse(JSON.stringify(article)),
      },
    }
  }
  
