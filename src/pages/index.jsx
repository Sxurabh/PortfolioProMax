import Image from 'next/image';
import Head from 'next/head';
import Link from 'next/link';
import clsx from 'clsx';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Container } from '@/components/Container';
import {
  TwitterIcon,
  InstagramIcon,
  GitHubIcon,
  LinkedInIcon,
} from '@/components/SocialIcons';
import image1 from '@/images/photos/image-1.jpg';
import image2 from '@/images/photos/image-2.jpg';
import image3 from '@/images/photos/image-3.jpg';
import image4 from '@/images/photos/image-4.jpg';
import image5 from '@/images/photos/image-5.jpg';
import logoAirbnb from '@/images/logos/airbnb.svg';
import logoFacebook from '@/images/logos/facebook.svg';
import logoPlanetaria from '@/images/logos/planetaria.svg';
import logoStarbucks from '@/images/logos/starbucks.svg';
import { formatDate } from '@/lib/formatDate';
import prisma from '@/lib/prisma';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

// Define page size for pagination
const PAGE_SIZE = 3;

function MailIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M2.75 7.75a3 3 0 0 1 3-3h12.5a3 3 0 0 1 3 3v8.5a3 3 0 0 1-3 3H5.75a3 3 0 0 1-3-3v-8.5Z"
        className="fill-zinc-100 stroke-zinc-400 dark:fill-zinc-100/10 dark:stroke-zinc-500"
      />
      <path
        d="m4 6 6.024 5.479a2.915 2.915 0 0 0 3.952 0L20 6"
        className="stroke-zinc-400 dark:stroke-zinc-500"
      />
    </svg>
  );
}

function BriefcaseIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M2.75 9.75a3 3 0 0 1 3-3h12.5a3 3 0 0 1 3 3v8.5a3 3 0 0 1-3 3H5.75a3 3 0 0 1-3-3v-8.5Z"
        className="fill-zinc-100 stroke-zinc-400 dark:fill-zinc-100/10 dark:stroke-zinc-500"
      />
      <path
        d="M3 14.25h6.249c.484 0 .952-.002 1.316.319l.777.682a.996.996 0 0 0 1.316 0l.777-.682c.364-.32.832-.319 1.316-.319H21M8.75 6.5V4.75a2 2 0 0 1 2-2h2.5a2 2 0 0 1 2 2V6.5"
        className="stroke-zinc-400 dark:stroke-zinc-500"
      />
    </svg>
  );
}

function ArrowDownIcon(props) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4.75 8.75 8 12.25m0 0 3.25-3.5M8 12.25v-8.5"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

function Article({ article }) {
  return (
    <Card
      as="article"
      className="transition-transform transform hover:scale-105 hover:shadow-lg"
    >
      <Card.Title href={`/articles/${article.slug}`}>
        {article.title}
      </Card.Title>
      <Card.Eyebrow as="time" dateTime={article.date} decorate>
        {formatDate(article.date)}
      </Card.Eyebrow>
      <Card.Description>{article.description}</Card.Description>
      <Card.Cta>Read article</Card.Cta>
    </Card>
  );
}

function SocialLink({ icon: Icon, ...props }) {
  return (
    <Link className="group -m-1 p-1 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-full" {...props}>
      <Icon className="h-6 w-6 fill-zinc-500 transition group-hover:fill-zinc-600 dark:fill-zinc-400 dark:group-hover:fill-zinc-300" />
    </Link>
  );
}

function Newsletter() {
  return (
    <form
      action="/thank-you"
      className="rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40"
    >
      <h2 className="flex text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <MailIcon className="h-6 w-6 flex-none" />
        <span className="ml-3">Stay up to date</span>
      </h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Get notified when I publish something new, and unsubscribe at any time.
      </p>
      <div className="mt-6 flex">
        <input
          type="email"
          placeholder="Email address"
          aria-label="Email address"
          required
          className="min-w-0 flex-auto appearance-none rounded-md border border-zinc-900/10 bg-white px-3 py-[calc(theme(spacing.2)-1px)] shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 dark:border-zinc-700 dark:bg-zinc-700/[0.15] dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-teal-400 dark:focus:ring-teal-400/10 sm:text-sm"
        />
        <Button type="submit" className="ml-4 flex-none hover:bg-teal-400 hover:text-white dark:hover:bg-teal-500 dark:hover:text-white">
          Join
        </Button>
      </div>
    </form>
  );
}

function Resume() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const [uploadStatus, setUploadStatus] = useState(null);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.includes('pdf')) {
      setUploadStatus('Please upload a PDF file.');
      return;
    }

    const formData = new FormData();
    formData.append('cv', file);

    setUploadStatus('Uploading...');

    try {
      const response = await fetch('/api/upload-cv', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setUploadStatus('CV uploaded successfully!');
      } else {
        setUploadStatus(result.error || 'Failed to upload CV.');
      }
    } catch (error) {
      setUploadStatus('Error uploading CV.');
    }
  };

  let resume = [
    {
      company: 'SG Analytics',
      title: 'Data Analyst',
      logo: logoPlanetaria,
      start: '2023',
      end: {
        label: 'Present',
        dateTime: new Date().getFullYear(),
      },
    },
    {
      company: 'eClerx',
      title: 'Analyst',
      logo: logoStarbucks,
      start: '2022',
      end: '2023',
    },
  ];

  return (
    <div className="rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40">
      <h2 className="flex text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <BriefcaseIcon className="h-6 w-6 flex-none" />
        <span className="ml-3">Work</span>
      </h2>
      <ol className="mt-6 space-y-4">
        {resume.map((role, roleIndex) => (
          <li key={roleIndex} className="flex gap-4">
            <div className="relative mt-1 flex h-10 w-10 flex-none items-center justify-center rounded-full shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0">
              <Image src={role.logo} alt="" className="h-7 w-7" unoptimized />
            </div>
            <dl className="flex flex-auto flex-wrap gap-x-2">
              <dt className="sr-only">Company</dt>
              <dd className="w-full flex-none text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {role.company}
              </dd>
              <dt className="sr-only">Role</dt>
              <dd className="text-xs text-zinc-500 dark:text-zinc-400">
                {role.title}
              </dd>
              <dt className="sr-only">Date</dt>
              <dd
                className="ml-auto text-xs text-zinc-400 dark:text-zinc-500"
                aria-label={`${role.start.label ?? role.start} until ${
                  role.end.label ?? role.end
                }`}
              >
                <time dateTime={role.start.dateTime ?? role.start}>
                  {role.start.label ?? role.start}
                </time>{' '}
                <span aria-hidden="true">—</span>{' '}
                <time dateTime={role.end.dateTime ?? role.end}>
                  {role.end.label ?? role.end}
                </time>
              </dd>
            </dl>
          </li>
        ))}
      </ol>
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <Button
          href="/cv.pdf"
          variant="secondary"
          className="group w-full sm:w-auto hover:bg-teal-400 hover:text-white dark:hover:bg-teal-500 dark:hover:text-white"
        >
          Download CV
          <ArrowDownIcon className="h-4 w-4 stroke-zinc-400 transition group-active:stroke-zinc-600 dark:group-hover:stroke-zinc-50 dark:group-active:stroke-zinc-50" />
        </Button>
        {isAdmin && (
          <label className="w-full sm:w-auto">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleUpload}
              className="hidden"
            />
            <span
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-800 cursor-pointer"
            >
              Upload CV
            </span>
          </label>
        )}
      </div>
      {uploadStatus && (
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">{uploadStatus}</p>
      )}
    </div>
  );
}

function Photos() {
  let rotations = ['rotate-2', '-rotate-2', 'rotate-2', 'rotate-2', '-rotate-2'];

  return (
    <div className="mt-16 sm:mt-20">
      <div className="relative">
        <div
          className={clsx(
            'flex sm:justify-center gap-5 py-4 sm:gap-8',
            'overflow-x-auto sm:overflow-hidden',
            'snap-x snap-mandatory',
            'scrollbar-thin scrollbar-thumb-teal-500 scrollbar-track-zinc-200 dark:scrollbar-track-zinc-700',
          )}
        >
          {[image1, image2, image3, image4, image5].map((image, imageIndex) => (
            <div
              key={image.src}
              className={clsx(
                'w-44 flex-none snap-center overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 sm:w-72 sm:rounded-2xl',
                rotations[imageIndex % rotations.length],
              )}
            >
              <Image
                src={image}
                alt={`Photo ${imageIndex + 1}`}
                sizes="(min-width: 640px) 18rem, 11rem"
                className="absolute inset-0 h-full w-full object-cover"
                priority={imageIndex < 2}
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white to-transparent dark:from-zinc-900 sm:hidden" />
        <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent dark:from-zinc-900 sm:hidden" />
      </div>
    </div>
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
      <ArrowUpIcon className="h-5 w-5 stroke-current
" />
    </button>
  );
}

export default function Home({ articles, totalPages, currentPage }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading state (since getServerSideProps fetches data server-side, this is mostly for UX)
    setIsLoading(false);
  }, []);

  return (
    <>
      <Head>
        <title>Saurabh Kirve - Data Analyst</title>
        <meta
          name="description"
          content="I’m Saurabh, an experienced Data Analyst proficient in creating comprehensive case studies to drive data-driven decisions. Skilled in data visualization, cleansing, and collection using Tableau, Python, and Excel."
        />
      </Head>
      <Container className="mt-9">
        <div className="max-w-2xl px-4 sm:px-0">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
            Saurabh Kirve
          </h1>
          <p className="mt-4 sm:mt-6 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Hello! I'm Saurabh, experienced Data Analyst proficient in creating
            comprehensive case studies to drive data-driven decisions. Skilled in data
            visualization, cleansing, and collection using Tableau, Python, and Excel.
            Committed to data ethics and integrity, with expertise in SQL querying,
            metadata analysis, and sample size determination. Knowledgeable in important
            data warehousing concepts, including ETL processes and dimensional
            modeling. Proficient in IBM Cognos Analytics for advanced analytics. Strong
            in problem-solving and decision-making, adept at developing impactful
            dashboards and pivot tables for effective storytelling. Ready to contribute
            to business growth through actionable insights.
          </p>
          <div className="mt-4 sm:mt-6 flex flex-wrap gap-4 sm:gap-6">
            <SocialLink
              href="https://twitter.com/sxurxbh"
              aria-label="Follow on Twitter"
              icon={TwitterIcon}
            />
            <SocialLink
              href="https://www.instagram.com/whosaurabh/"
              aria-label="Follow on Instagram"
              icon={InstagramIcon}
            />
            <SocialLink
              href="https://github.com/Sxurabh"
              aria-label="Follow on GitHub"
              icon={GitHubIcon}
            />
            <SocialLink
              href="https://www.linkedin.com/in/saurabhkirve"
              aria-label="Follow on LinkedIn"
              icon={LinkedInIcon}
            />
          </div>
          <div className="mt-4">
            
          </div>
        </div>
      </Container>
      <Photos />
      <Container className="mt-24 md:mt-28">
        <div className="mx-auto grid max-w-xl grid-cols-1 gap-y-20 lg:max-w-none lg:grid-cols-2">
          <div className="flex flex-col gap-16">
            {isLoading ? (
              // Skeleton loader while loading
              Array.from({ length: PAGE_SIZE }).map((_, idx) => (
                <div
                  key={idx}
                  className="animate-pulse rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40"
                >
                  <div className="h-6 w-3/4 bg-zinc-200 dark:bg-zinc-700 rounded mb-4"></div>
                  <div className="h-4 w-1/4 bg-zinc-200 dark:bg-zinc-700 rounded mb-2"></div>
                  <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-700 rounded mb-2"></div>
                  <div className="h-4 w-5/6 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                </div>
              ))
            ) : articles.length === 0 ? (
              // No articles found message
              <div className="text-center text-zinc-600 dark:text-zinc-400">
                <p className="text-lg font-semibold">No Articles Found</p>
                <p className="mt-2">Check back later for new articles!</p>
              </div>
            ) : (
              articles.map((article) => (
                <Article key={article.slug} article={article} />
              ))
            )}
            {/* Enhanced Pagination */}
            <div className="flex justify-center mt-12 space-x-2 items-center">
              {currentPage > 1 && (
                <Link
                  href={`/?page=${currentPage - 1}`}
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
                  href={`/?page=${idx + 1}`}
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
                  href={`/?page=${currentPage + 1}`}
                  className="flex items-center px-3 py-2 rounded-lg text-sm bg-zinc-200 dark:bg-zinc-700 hover:bg-teal-100 dark:hover:bg-teal-700 transition text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  aria-label="Next page"
                >
                  Next
                  <ChevronRightIcon className="h-4 w-4 ml-1 stroke-current" />
                </Link>
              )}
            </div>
          </div>
          <div className="space-y-10 lg:pl-16 xl:pl-24">
            <Newsletter />
            <Resume />
          </div>
        </div>
      </Container>
      <ScrollToTopButton />
    </>
  );
}

export async function getServerSideProps(context) {
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
      date: article.createdAt.toISOString(),
      createdAt: article.createdAt.toISOString(),
      slug: article.slug || article.id,
    }));

    const totalPages = Math.ceil(totalArticles / PAGE_SIZE);

    return {
      props: {
        articles,
        totalPages,
        currentPage: page,
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps on homepage:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return {
      props: {
        articles: [],
        totalPages: 1,
        currentPage: 1,
      },
    };
  }
}