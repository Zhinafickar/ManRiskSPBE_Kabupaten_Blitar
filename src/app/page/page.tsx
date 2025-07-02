'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This is a workaround for a persistent dev server issue
// where it incorrectly tries to route to /page.
// This component will catch that route and redirect to the root.
export default function PageFallback() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/');
  }, [router]);

  return null; // Render nothing while redirecting
}
