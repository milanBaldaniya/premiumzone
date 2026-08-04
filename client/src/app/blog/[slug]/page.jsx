'use client';

import { use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaArrowLeft } from 'react-icons/fa';
import { useGetBlogBySlugQuery } from '@/store/api/catalogApi';
import { formatDate } from '@/lib/utils';

const PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="900" height="480"><rect width="100%25" height="100%25" fill="%23e2e8f0"/></svg>';

export default function BlogDetailPage({ params }) {
  const { slug } = use(params);
  const { data, isLoading } = useGetBlogBySlugQuery(slug);
  const blog = data?.data;

  if (isLoading) {
    return (
      <div className="container-luxe max-w-3xl py-12">
        <div className="skeleton mb-6 h-10 w-3/4 rounded" />
        <div className="skeleton mb-8 aspect-[16/9] rounded-2xl" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-4 w-full rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!blog) {
    return <div className="container-luxe py-24 text-center text-slate-500">Article not found.</div>;
  }

  return (
    <article className="container-luxe max-w-3xl py-12">
      <Link href="/blog" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-accent">
        <FaArrowLeft size={12} /> Back to journal
      </Link>

      <div className="mb-4 flex items-center gap-2 text-xs text-slate-400">
        <span className="font-semibold uppercase tracking-wider text-accent-dark">{blog.category}</span>
        <span>·</span>
        <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
        {blog.readTime && <><span>·</span><span>{blog.readTime} min read</span></>}
      </div>

      <h1 className="font-display text-4xl font-bold leading-tight text-primary">{blog.title}</h1>

      {blog.author?.name && (
        <div className="mt-6 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-bold text-accent">
            {blog.author.name[0]}
          </div>
          <span className="text-sm font-medium text-slate-600">{blog.author.name}</span>
        </div>
      )}

      <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl bg-slate-50">
        <Image src={blog.coverImage?.url || PLACEHOLDER} alt={blog.title} fill className="object-cover" priority />
      </div>

      <div className="prose prose-slate mt-8 max-w-none whitespace-pre-line leading-relaxed text-slate-700">
        {blog.content}
      </div>
    </article>
  );
}
