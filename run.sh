#!/bin/sh
# usage: ./run.sh testnet|mainnet script.mjs   (secrets read from /workspace/secure, never committed)
F=/workspace/secure/memwal_$1.json
[ -f "$F" ] && export MEMWAL_KEY=$(node -e "console.log(require('$F').delegateKey)") MEMWAL_ACCOUNT_ID=$(node -e "console.log(require('$F').accountId)")
[ -f /workspace/secure/tatum_api_key.txt ] && export TATUM_API_KEY=$(tr -d ' \n\r' </workspace/secure/tatum_api_key.txt)
[ "$1" = mainnet ] && export MEMWAL_SERVER_URL=https://relayer.memory.walrus.xyz
node $2
