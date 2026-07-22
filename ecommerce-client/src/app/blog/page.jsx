'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useGetBlogsQuery } from '@/store/api/catalogApi';
import { formatDate, truncate } from '@/lib/utils';

const PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240"><rect width="100%25" height="100%25" fill="%23e2e8f0"/></svg>';

export default function BlogPage() {
  const { data, isLoading } = useGetBlogsQuery({ limit: 12 });
  const blogs = data?.data || [];

  return (
    <div className="container-luxe py-10">
      <div className="mb-10 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent-dark">Journal</p>
        <h1 className="font-display text-4xl font-bold text-primary">The Premium Journal</h1>
        <p className="mt-3 text-slate-500">Stories, guides and insights from the world of luxury.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-80 rounded-2xl" />
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <p className="py-20 text-center text-slate-400">No articles published yet.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <Link key={blog._id} href={`/blog/${blog.slug}`} className="card-luxe group overflow-hidden hover:shadow-luxe">
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-50">
                <Image
                  src={blog.coverImage?.url || PLACEHOLDER}
                  alt={blog.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="space-y-2 p-5">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider text-accent-dark">{blog.category}</span>
                  <span>·</span>
                  <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
                </div>
                <h2 className="font-display text-lg font-bold text-primary">{blog.title}</h2>
                <p className="text-sm leading-relaxed text-slate-500">{truncate(blog.excerpt, 110)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
