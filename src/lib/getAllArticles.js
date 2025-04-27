// lib/getAllArticles.js

import prisma from '@/lib/prisma';

export async function getAllArticles() {
  try {
    const articles = await prisma.article.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        createdAt: true,
      },
    });

    return articles.map(({ createdAt, ...article }) => ({
      ...article,
      date: createdAt.toISOString(), // Map createdAt to date
    }));
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}