# Tally — a shared budget that remembers
Walrus x Tatum "Total Recall" entry by Astra Trading Company (Consumer Finance track).
Group expenses, who-owes-what, and learned spending limits/habits persisted in **Walrus Memory** (MemWal), so the app picks up where the group left off across sessions. Tatum Sui RPC for on-chain settlement reads (in progress).
- `tally.mjs` core (falls back to the offline `MemWalMock` without credentials)
- `setup_account.mjs` creates a MemWalAccount + delegate key server-side (keys stay in a local secure dir, never committed)
- `node test.mjs` offline test
Contact: carl.astratc@proton.me
