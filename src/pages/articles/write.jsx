import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { SimpleLayout } from '@/components/SimpleLayout';

export default function WriteArticle() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      router.push('/articles');
    } else {
      console.error('Failed to create article');
    }
  };

  return (
    <>
      <Head>
        <title>Write New Article</title>
      </Head>
      <SimpleLayout title="Write a New Article" intro="Fill in the details below to create a new article.">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              id="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700">Slug</label>
            <input
              type="text"
              name="slug"
              id="slug"
              required
              value={formData.slug}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              id="description"
              required
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
            <textarea
              name="content"
              id="content"
              required
              value={formData.content}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <button
              type="submit"
              className="inline-block rounded-xl bg-teal-500 px-4 py-2 text-white hover:bg-teal-600 transition"
            >
              Publish Article
            </button>
          </div>
        </form>
      </SimpleLayout>
    </>
  );
}
