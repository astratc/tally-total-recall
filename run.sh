#!/bin/sh
# usage: ./run.sh testnet|mainnet script.mjs
F=/workspace/secure/memwal_$1.json
export MEMWAL_KEY=$(node -e "console.log(require('$F').delegateKey)") MEMWAL_ACCOUNT_ID=$(node -e "console.log(require('$F').accountId)")
[ "$1" = mainnet ] && export MEMWAL_SERVER_URL=https://relayer.memory.walrus.xyz
node $2
