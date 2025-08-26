'use client'; // Required for error boundaries

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GlobalError({ error, reset }) {
  const router = useRouter();
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <>
      <h2>Something went wrong!</h2>
      <p>{error?.message || 'Unexpected error occurred.'}</p>
      <button onClick={() => reset()}>Try again</button>
      <button onClick={() => router.push('/')}>Go to Home </button>
    </>
  );
}
