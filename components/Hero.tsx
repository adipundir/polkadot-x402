export default function Hero() {
  return (
    <section className="section-dark min-h-screen flex items-center pt-24">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-12 w-full py-16">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-[color:var(--tone-muted)] mb-6">
              Polkadot · x402
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-[56px] leading-[1.1] font-semibold text-[color:var(--tone-light)] mb-10">
              Deterministic x402 facilitation with a two-tone control surface.
            </h1>
            <p className="text-lg md:text-xl text-[color:var(--tone-muted)] max-w-2xl mb-10">
              Operate a payment facilitator that feels crafted, not generated. A single
              stack to verify, settle, and observe Polkadot-linked x402 flows.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/docs" className="btn btn-primary text-base">
                Read the docs
              </a>
              <a href="/docs#api" className="btn btn-outline text-base">
                API reference
              </a>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--tone-muted)] mb-2">
                  Facilitator status
                </p>
                <p className="text-lg font-semibold text-[color:var(--tone-light)]">Online</p>
              </div>
              <div className="w-12 h-12 rounded-full border border-[color:var(--tone-border)] flex items-center justify-center text-sm font-semibold">
                x402
              </div>
            </div>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between border border-[color:var(--tone-border)] rounded-2xl px-4 py-3">
                <p className="uppercase tracking-[0.3em] text-[color:var(--tone-muted)] text-xs">
                  Verify
                </p>
                <span className="text-[color:var(--tone-light)] font-semibold">23 ms</span>
              </div>
              <div className="flex items-center justify-between border border-[color:var(--tone-border)] rounded-2xl px-4 py-3">
                <p className="uppercase tracking-[0.3em] text-[color:var(--tone-muted)] text-xs">
                  Settle
                </p>
                <span className="text-[color:var(--tone-light)] font-semibold">1 tx / sec</span>
              </div>
              <div className="flex items-center justify-between border border-[color:var(--tone-border)] rounded-2xl px-4 py-3">
                <p className="uppercase tracking-[0.3em] text-[color:var(--tone-muted)] text-xs">
                  Network
                </p>
                <span className="text-[color:var(--tone-light)] font-semibold">
                  Polkadot Hub Testnet
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

