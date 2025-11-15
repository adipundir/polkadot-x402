import CodeBlock from '@/components/CodeBlock';

export default function DocsPage() {
  const toc = [
    { href: '#setup', label: 'Developer setup' },
    { href: '#api', label: 'API reference' },
    { href: '#integration', label: 'Integration guide' },
  ];

  return (
    <main className="section-light min-h-screen pt-24">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-12 py-16">
        <div className="grid lg:grid-cols-[220px_1fr] gap-12">
          <aside className="hidden lg:flex flex-col sticky top-28 h-max">
            <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--tone-dark)]/50 mb-4">
              Contents
            </p>
            <nav className="space-y-2 text-sm">
              {toc.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 rounded-xl border border-transparent text-[color:var(--tone-dark)]/70 hover:border-[color:var(--tone-dark)]/20 hover:text-[color:var(--tone-dark)] transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </aside>

          <div className="space-y-16">
            <header className="space-y-4">
              <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--tone-dark)]/50">
                Documentation
              </p>
              <h1 className="text-4xl md:text-5xl font-semibold text-[color:var(--tone-dark)]">
                x402 facilitator runbook.
              </h1>
              <p className="text-lg text-[color:var(--tone-dark)]/80 max-w-2xl">
              </p>
            </header>

            <section id="setup" className="space-y-8">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--tone-dark)]/50">
                  Section 01
                </p>
                <h2 className="text-3xl font-semibold text-[color:var(--tone-dark)]">
                  Developer setup
                </h2>
                <p className="text-[color:var(--tone-dark)]/80">
                  Get the facilitator running locally with minimal ceremony.
                </p>
              </div>

              <div className="grid gap-6">
                <div className="border border-[color:var(--tone-border-strong)] rounded-2xl p-6 bg-[color:var(--tone-light)]">
                  <h3 className="text-lg font-semibold text-[color:var(--tone-dark)] mb-4">Prerequisites</h3>
                  <ul className="space-y-2 text-[color:var(--tone-dark)]/80">
                    <li>Node.js 18+ and npm (or pnpm)</li>
                    <li>EVM wallet private key with testnet funds</li>
                    <li>RPC endpoint for your target chain</li>
                  </ul>
                </div>

                <div className="border border-[color:var(--tone-border-strong)] rounded-2xl p-6 bg-[color:var(--tone-light)]">
                  <h3 className="text-lg font-semibold text-[color:var(--tone-dark)] mb-4">Install</h3>
                  <CodeBlock
                    code={`git clone <repository-url>
cd polkadot-x402
npm install`}
                    language="bash"
                  />
                </div>

                <div className="border border-[color:var(--tone-border-strong)] rounded-2xl p-6 bg-[color:var(--tone-light)]">
                  <h3 className="text-lg font-semibold text-[color:var(--tone-dark)] mb-4">Environment</h3>
                  <p className="text-[color:var(--tone-dark)]/80 mb-4">
                    Drop a <code>.env.local</code> in the project root:
                  </p>
                  <CodeBlock
                    code={`EVM_PRIVATE_KEY=0x...
RPC_URL=https://testnet-passet-hub-eth-rpc.polkadot.io
NETWORK=polkadot-hub-testnet

# Optional overrides
CHAIN_ID=420420422
CHAIN_NAME=Polkadot Hub TestNet
CHAIN_RPC_URL=https://testnet-passet-hub-eth-rpc.polkadot.io
NATIVE_CURRENCY_NAME=PAS
NATIVE_CURRENCY_SYMBOL=PAS
NATIVE_CURRENCY_DECIMALS=18
GAS_LIMIT=500000
GAS_PRICE_MULTIPLIER=1.0`}
                    language="bash"
                    title=".env.local"
                  />
                  <div className="border border-[color:var(--tone-border-strong)] rounded-xl px-4 py-3 text-sm text-[color:var(--tone-dark)]/70 mt-4">
                    Keep the file out of version control. It belongs in <code>.gitignore</code>.
                  </div>
                </div>

                <div className="border border-[color:var(--tone-border-strong)] rounded-2xl p-6 bg-[color:var(--tone-light)] space-y-4">
                  <h3 className="text-lg font-semibold text-[color:var(--tone-dark)]">Run</h3>
                  <CodeBlock code={`npm run dev`} language="bash" />
                  <p className="text-[color:var(--tone-dark)]/80">
                    Visit <code>http://localhost:3000</code>. Production build:
                  </p>
                  <CodeBlock code={`npm run build
npm start`} language="bash" />
                </div>
              </div>
            </section>

            <section id="api" className="space-y-8">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--tone-dark)]/50">
                  Section 02
                </p>
                <h2 className="text-3xl font-semibold text-[color:var(--tone-dark)]">
                  API reference
                </h2>
                <p className="text-[color:var(--tone-dark)]/80">
                  Three endpoints. All JSON. All CORS-enabled.
                </p>
              </div>

              <article className="border border-[color:var(--tone-border-strong)] rounded-3xl p-6 bg-[color:var(--tone-light)] space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--tone-dark)]/50 mb-2">
                    GET
                  </p>
                  <h3 className="text-2xl font-semibold text-[color:var(--tone-dark)]">/api/supported</h3>
                  <p className="text-[color:var(--tone-dark)]/80 mt-2">
                    Returns supported payment configurations.
                  </p>
                </div>
                <CodeBlock
                  code={`GET /api/supported

[
  {
    "x402Version": 1,
    "scheme": "exact",
    "network": "polkadot-hub-testnet",
    "extra": {}
  }
]`}
                  language="json"
                />
              </article>

              <article className="border border-[color:var(--tone-border-strong)] rounded-3xl p-6 bg-[color:var(--tone-light)] space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--tone-dark)]/50 mb-2">
                    POST
                  </p>
                  <h3 className="text-2xl font-semibold text-[color:var(--tone-dark)]">/api/verify</h3>
                </div>
                <CodeBlock code={`POST /api/verify
Content-Type: application/json

{
  "payload": "0x...",
  "details": {
    "x402Version": 1,
    "scheme": "exact",
    "network": "polkadot-hub-testnet",
    "extra": {}
  }
}

// Response
{
  "valid": true,
  "details": {
    "amount": "1000000000000000000",
    "token": "0x...",
    "from": "0x...",
    "to": "0x..."
  }
}`} language="json" />
              </article>

              <article className="border border-[color:var(--tone-border-strong)] rounded-3xl p-6 bg-[color:var(--tone-light)] space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--tone-dark)]/50 mb-2">
                    POST
                  </p>
                  <h3 className="text-2xl font-semibold text-[color:var(--tone-dark)]">/api/settle</h3>
                </div>
                <CodeBlock code={`POST /api/settle
Content-Type: application/json

{
  "payload": "0x...",
  "details": {
    "x402Version": 1,
    "scheme": "exact",
    "network": "polkadot-hub-testnet",
    "extra": {}
  }
}

// Response
{
  "success": true,
  "transactionHash": "0x..."
}`} language="json" />
              </article>

              <div className="border border-[color:var(--tone-border-strong)] rounded-2xl p-6 bg-[color:var(--tone-light)]">
                <h4 className="text-lg font-semibold text-[color:var(--tone-dark)] mb-4">Errors</h4>
                <CodeBlock
                  code={`{
  "error": "Error message",
  "code": "INVALID_PAYLOAD",
  "details": {}
}`}
                  language="json"
                />
                <p className="text-sm text-[color:var(--tone-dark)]/70 mt-4">
                  Codes: INVALID_PAYLOAD · INVALID_DETAILS · INVALID_VERSION · MISSING_SCHEME · MISSING_NETWORK · INTERNAL_ERROR
                </p>
              </div>
            </section>

            <section id="integration" className="space-y-8">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--tone-dark)]/50">
                  Section 03
                </p>
                <h2 className="text-3xl font-semibold text-[color:var(--tone-dark)]">
                  Integration guide
                </h2>
                <p className="text-[color:var(--tone-dark)]/80">
                  Drop-in fetch examples for verify and settle flows.
                </p>
              </div>

              <div className="space-y-6">
                <CodeBlock code={`async function getSupportedPayments() {
  const res = await fetch('https://your-facilitator.com/api/supported');
  return res.json();
}

async function verifyPayment(payload, details) {
  const res = await fetch('https://your-facilitator.com/api/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payload, details }),
  });
  if (!res.ok) throw new Error('Verification failed');
  return res.json();
}

async function settlePayment(payload, details) {
  const res = await fetch('https://your-facilitator.com/api/settle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payload, details }),
  });
  if (!res.ok) throw new Error('Settlement failed');
  return res.json();
}`} language="typescript" />

                <CodeBlock code={`async function processPayment(payload) {
  const details = {
    x402Version: 1,
    scheme: 'exact',
    network: 'polkadot-hub-testnet',
  };

  const verification = await verifyPayment(payload, details);
  if (!verification.valid) throw new Error(verification.error || 'Verification failed');

  const settlement = await settlePayment(payload, details);
  if (!settlement.success) throw new Error(settlement.error || 'Settlement failed');

  return settlement.transactionHash;
}`} language="typescript" />

                <CodeBlock
                  code={`# Custom chain configuration
CHAIN_ID=12345
CHAIN_NAME=My Custom Chain
CHAIN_RPC_URL=https://rpc.example.com
NATIVE_CURRENCY_NAME=ETH
NATIVE_CURRENCY_SYMBOL=ETH
NATIVE_CURRENCY_DECIMALS=18`}
                  language="bash"
                />

                <CodeBlock
                  code={`{
  "x402Version": 1,
  "scheme": "exact",
  "network": "my-custom-chain",
  "extra": {}
}`}
                  language="json"
                />
              </div>
            </section>

            <footer className="border-t border-[color:var(--tone-border-strong)] pt-8 text-sm text-[color:var(--tone-dark)]/60">
              Questions? ping the API endpoints first—then open an issue.
            </footer>
          </div>
        </div>
      </div>
    </main>
  );
}

