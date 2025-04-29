import Image from 'next/future/image';
import Head from 'next/head';
import { Card } from '@/components/Card';
import { SimpleLayout } from '@/components/SimpleLayout';
import logoAnimaginary from '@/images/logos/animaginary.svg';
import logoCosmos from '@/images/logos/cosmos.svg';
import logoHelioStream from '@/images/logos/helio-stream.svg';
import logoOpenShuttle from '@/images/logos/open-shuttle.svg';
import logoPlanetaria from '@/images/logos/planetaria.svg';
import clsx from 'clsx';
import { useState, useEffect } from 'react';

const projects = [
  {
    name: 'Excel Sales Dashboard',
    description:
      'A dynamic dashboard built in Excel that visualizes monthly sales performance, region-wise breakdown, and product-wise analysis with interactive slicers and KPIs.',
    link: { href: 'https://github.com/Sxurabh/ExcelProject', label: 'GitHub' },
    logo: logoPlanetaria,
  },
  {
    name: 'SQL Data Exploration',
    description:
      'A project focused on querying and analyzing a large retail dataset using advanced SQL techniques like CTEs, window functions, and joins to derive meaningful business insights.',
    link: { href: '#', label: 'github.com' },
    logo: logoAnimaginary,
  },
  {
    name: 'Power BI Profitability Report',
    description:
      'An interactive Power BI report that highlights profitability across product categories and customer segments. Includes custom visuals, drill-through, and DAX-based metrics.',
    link: { href: '#', label: 'github.com' },
    logo: logoHelioStream,
  },
  {
    name: 'cosmOS',
    description:
      'The operating system that powers our Planetaria space shuttles.',
    link: { href: '#', label: 'github.com' },
    logo: logoCosmos,
  },
];

function LinkIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M15.712 11.823a.75.75 0 1 0 1.06 1.06l-1.06-1.06Zm-4.95 1.768a.75.75 0 0 0 1.06-1.06l-1.06 1.06Zm-2.475-1.414a.75.75 0 1 0-1.06-1.06l1.06 1.06Zm4.95-1.768a.75.75 0 0 0-1.06 1.06l1.06-1.06Zm3.359.53-.884.884 1.06 1.06.885-.883-1.061-1.06Zm-4.95-2.12 1.414-1.415L12 6.344l-1.415 1.413 1.061 1.061Zm0 3.535a2.5 2.5 0 0 1 0-3.536l-1.06-1.06a4 4 0 0 0 0 5.656l1.06-1.06Zm4.95-4.95a2.5 2.5 0 0 1 0 3.535L17.656 12a4 4 0 0 0 0-5.657l-1.06 1.06Zm1.06-1.06a4 4 0 0 0-5.656 0l1.06 1.06a2.5 2.5 0 0 1 3.536 0l1.06-1.06Zm-7.07 7.07.176.177 1.06-1.06-.176-.177-1.06 1.06Zm-3.183-.353.884-.884-1.06-1.06-.884.883 1.06 1.06Zm4.95 2.121-1.414 1.414 1.06 1.06 1.415-1.413-1.06-1.061Zm0-3.536a2.5 2.5 0 0 1 0 3.536l1.06 1.06a4 4 0 0 0 0-5.656l-1.06 1.06Zm-4.95 4.95a2.5 2.5 0 0 1 0-3.535L6.344 12a4 4 0 0 0 0 5.656l1.06-1.06Zm-1.06 1.06a4 4 0 0 0 5.657 0l-1.061-1.06a2.5 2.5 0 0 1-3.535 0l-1.061 1.06Zm7.07-7.07-.176-.177-1.06 1.06.176.178 1.06-1.061Z"
        fill="currentColor"
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

export default function Projects() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading state (for future-proofing if projects are fetched dynamically)
    setIsLoading(false);
  }, []);

  return (
    <>
      <Head>
        <title>Projects - Saurabh Kirve</title>
        <meta
          name="description"
          content="Things I’ve made trying to put my dent in the universe."
        />
      </Head>
      <SimpleLayout
        title="Projects I’ve built to turn data into powerful stories."
        intro="Over the years, I’ve worked on several data-centric projects that bring insights to life. Below are the ones I’m most proud of—each solving a specific problem using tools like Excel, SQL, and Power BI. These projects are designed not just to showcase my skills but also to deliver real business value through analytics."
      >
        {isLoading ? (
          <ul
            role="list"
            className="grid grid-cols-1 gap-x-6 gap-y-16 sm:grid-cols-2 sm:gap-x-12 lg:grid-cols-3"
          >
            {Array.from({ length: 4 }).map((_, idx) => (
              <li key={idx} className="animate-pulse">
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0">
                  <div className="h-8 w-8 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
                </div>
                <div className="mt-6 h-5 w-3/4 bg-zinc-200 dark:bg-zinc-700 rounded" />
                <div className="mt-2 h-4 w-full bg-zinc-200 dark:bg-zinc-700 rounded" />
                <div className="mt-2 h-4 w-5/6 bg-zinc-200 dark:bg-zinc-700 rounded" />
                <div className="mt-6 flex items-center">
                  <div className="h-6 w-6 bg-zinc-200 dark:bg-zinc-700 rounded" />
                  <div className="ml-2 h-4 w-1/4 bg-zinc-200 dark:bg-zinc-700 rounded" />
                </div>
              </li>
            ))}
          </ul>
        ) : projects.length === 0 ? (
          <div className="text-center text-zinc-600 dark:text-zinc-400">
            <p className="text-lg font-semibold">No Projects Found</p>
            <p className="mt-2">Check back later for new projects!</p>
          </div>
        ) : (
          <ul
            role="list"
            className="grid grid-cols-1 gap-x-6 gap-y-16 sm:grid-cols-2 sm:gap-x-12 lg:grid-cols-3"
          >
            {projects.map((project) => (
              <Card
                as="li"
                key={project.name}
                className="transition-transform transform hover:scale-[1.02] hover:shadow-lg"
              >
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0">
                  <Image
                    src={project.logo}
                    alt={`${project.name} logo`}
                    className="h-8 w-8"
                    unoptimized
                  />
                </div>
                <h2 className="mt-6 text-base font-semibold text-zinc-800 dark:text-zinc-100">
                  <Card.Link href={project.link.href}>{project.name}</Card.Link>
                </h2>
                <Card.Description>{project.description}</Card.Description>
                <p className="relative z-10 mt-6 flex text-sm font-medium text-zinc-400 group-hover:text-teal-500 dark:text-zinc-200">
                  <LinkIcon className="h-6 w-6 flex-none transition-transform group-hover:scale-110" />
                  <a
                    href={project.link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded"
                    aria-label={`View ${project.name} on ${project.link.label}`}
                  >
                    {project.link.label}
                  </a>
                </p>
              </Card>
            ))}
          </ul>
        )}

        
      </SimpleLayout>

      <ScrollToTopButton />
    </>
  );
}