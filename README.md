# Tally — a shared budget that remembers
Walrus x Tatum "Total Recall" entry by Astra Trading Company (Consumer Finance track).
Group expenses, who-owes-what, and learned spending limits/habits persisted in **Walrus Memory** (MemWal), so the app picks up where the group left off across sessions. Tatum Sui RPC for on-chain settlement reads (in progress).
- `tally.mjs` core (falls back to the offline `MemWalMock` without credentials)
- `setup_account.mjs` creates a MemWalAccount + delegate key server-side (keys stay in a local secure dir, never committed)
- `tatum.mjs` Tatum Sui mainnet gateway (GraphQL): balances + incoming USDC settlements; `Tally.reconcile()` auto-closes debts
- `node test.mjs`, `node test_tatum.mjs` (TATUM_LIVE=1 for a live gateway check via `./run.sh`)
Contact: carl.astratc@proton.me
