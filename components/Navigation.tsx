'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[color:var(--tone-border)] bg-[color:rgba(5,6,8,0.9)] backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3">
            <span className="text-2xl font-semibold tracking-tight text-[color:var(--tone-light)]">
              x402
            </span>
            <span className="text-xs uppercase tracking-[0.4em] text-[color:var(--tone-muted)]">
              Facilitator
            </span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-10">
            <Link
              href="/"
              className={`text-sm font-medium tracking-widest transition-colors ${
                pathname === '/'
                  ? 'text-[color:var(--tone-light)]'
                  : 'text-[color:var(--tone-muted)] hover:text-[color:var(--tone-light)]'
              }`}
            >
              Home
            </Link>
            <Link
              href="/docs"
              className={`text-sm font-medium tracking-widest transition-colors ${
                pathname === '/docs'
                  ? 'text-[color:var(--tone-light)]'
                  : 'text-[color:var(--tone-muted)] hover:text-[color:var(--tone-light)]'
              }`}
            >
              Documentation
            </Link>
            <Link
              href="/docs#api"
              className="text-sm font-medium tracking-widest text-[color:var(--tone-muted)] hover:text-[color:var(--tone-light)] transition-colors"
            >
              API
            </Link>
          </div>

          <Link
            href="/docs"
            className="btn btn-primary text-sm"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

