export default function WalletsDocsPage() {
  return (
    <article className="max-w-3xl">
      <h1 className="font-impact text-3xl uppercase tracking-wide text-text-primary">Wallets</h1>
      <p className="mt-3 text-lg text-text-secondary">
        Smart wallet architecture for secure, gasless transactions on Algorand.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">Wallet Sets</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Wallets are organized into wallet sets. Each set can contain multiple Algorand accounts,
          making it easy to isolate funds by agent, purpose, or environment.
        </p>
        <pre className="mt-3 overflow-x-auto neopop-card-flat p-4 font-mono text-sm text-text-primary"><code>{`from algopay import AlgoPay

ap = AlgoPay()

# Create a wallet set
ws = ap.wallet.create_set("production-agents")

# Create a wallet within the set
wallet = ap.wallet.create("agent-1", wallet_set=ws.id)
print(wallet.address)  # Algorand address`}</code></pre>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">Custodial vs External</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="neopop-card-flat border-l-4 border-l-neopop-yellow p-5">
            <p className="text-sm font-bold uppercase tracking-wide text-text-primary">Custodial</p>
            <p className="mt-2 text-sm text-text-secondary">
              Generated and encrypted in AlgoPay&apos;s vault. Mnemonics stored with AES-256-GCM.
              Best for automated agent workflows.
            </p>
          </div>
          <div className="neopop-card-flat border-l-4 border-l-neopop-blue p-5">
            <p className="text-sm font-bold uppercase tracking-wide text-text-primary">External</p>
            <p className="mt-2 text-sm text-text-secondary">
              Connect Pera, Defly, or other Algorand wallets via WalletConnect. 
              User signs transactions directly. Best for human-in-the-loop.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">Balance Queries</h2>
        <pre className="mt-3 overflow-x-auto neopop-card-flat p-4 font-mono text-sm text-text-primary"><code>{`# ALGO balance
balance = ap.wallet.balance(wallet.id)
print(f"{balance.algo} ALGO")

# USDC balance (ASA)
print(f"{balance.usdc} USDC")`}</code></pre>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">Security</h2>
        <ul className="mt-3 space-y-2 text-sm text-text-secondary">
          <li className="flex items-start gap-2"><span className="mt-1 block h-1.5 w-1.5 shrink-0 bg-neopop-yellow" />Mnemonics encrypted with AES-256-GCM using ALGOPAY_VAULT_MASTER_KEY</li>
          <li className="flex items-start gap-2"><span className="mt-1 block h-1.5 w-1.5 shrink-0 bg-neopop-yellow" />Keys never leave the server — vault decryption happens only during transaction signing</li>
          <li className="flex items-start gap-2"><span className="mt-1 block h-1.5 w-1.5 shrink-0 bg-neopop-yellow" />All wallet operations logged in the audit trail</li>
        </ul>
      </section>
    </article>
  );
}
