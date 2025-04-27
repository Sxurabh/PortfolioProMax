import { useState } from "react"
import { useRouter } from "next/router"

export default function ArticleForm({ initialData = {} }) {
  const router = useRouter()
  const [title, setTitle] = useState(initialData.title || "")
  const [description, setDescription] = useState(initialData.description || "")
  const [slug, setSlug] = useState(initialData.slug || "")
  const [content, setContent] = useState(initialData.content || "")

  async function handleSubmit(e) {
    e.preventDefault()

    const res = await fetch('/api/articles', {
      method: initialData.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: initialData.id, title, description, slug, content }),
    })

    if (res.ok) {
      router.push('/articles')
    } else {
      alert("Error saving article!")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-2xl mx-auto">
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="input"
      />
      <input
        type="text"
        placeholder="Slug (e.g. my-first-article)"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        required
        className="input"
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        className="textarea"
      />
      <textarea
        placeholder="Content (Markdown supported)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        className="textarea"
        rows={10}
      />
      <button type="submit" className="btn-primary">
        {initialData.id ? "Update" : "Publish"} Article
      </button>
    </form>
  )
}
