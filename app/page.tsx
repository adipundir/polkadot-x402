'use client';

import dynamic from 'next/dynamic';

// Dynamically import wallet-dependent code to avoid SSR issues
const X402Demo = dynamic(() => import('./x402-demo'), { ssr: false });

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <X402Demo />
      </main>
    </div>
  );
}
