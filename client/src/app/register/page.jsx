import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Create Account',
  robots: { index: false, follow: false },
};

// Registration is Google-only now (an account is created automatically on
// first Google sign-in) — this route just forwards any old/bookmarked links
// to the single login page, preserving the redirect/intent query params.
export default async function RegisterPage({ searchParams }) {
  const params = await searchParams;
  const qs = new URLSearchParams(params).toString();
  redirect(qs ? `/login?${qs}` : '/login');
}
