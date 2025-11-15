'use client';

import { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export default function CodeBlock({ code, language = 'typescript', title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-6">
      {title && (
        <div className="bg-[color:var(--tone-dark)] text-[color:var(--tone-light)]/70 px-4 py-2 rounded-t-2xl text-sm font-medium tracking-wide border border-b-0 border-[color:var(--tone-border)]">
          {title}
        </div>
      )}
      <div className="relative bg-[color:var(--tone-dark)] border border-[color:var(--tone-border)] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-[color:var(--tone-border)]">
          <span className="text-xs uppercase tracking-[0.4em] text-[color:var(--tone-muted)]">{language}</span>
          <button
            onClick={copyToClipboard}
            className="text-xs text-[color:var(--tone-muted)] hover:text-[color:var(--tone-light)] transition-colors"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <pre className="p-5 overflow-x-auto text-[color:var(--tone-light)] text-sm leading-relaxed">
          <code className={`language-${language}`}>{code}</code>
        </pre>
      </div>
    </div>
  );
}

