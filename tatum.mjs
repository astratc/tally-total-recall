// Tatum Sui mainnet gateway (GraphQL interface; Tatum's Sui JSON-RPC path is retired on the gateway).
const URL = process.env.TATUM_SUI_URL ?? 'https://sui-mainnet.gateway.tatum.io/graphql';
export const USDC = '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC';
async function gql(query, variables={}, fetchImpl=fetch){
  const key=process.env.TATUM_API_KEY; if(!key) throw new Error('TATUM_API_KEY missing');
  const r=await fetchImpl(URL,{method:'POST',headers:{'content-type':'application/json','x-api-key':key},body:JSON.stringify({query,variables})});
  const j=await r.json(); if(j.errors) throw new Error(JSON.stringify(j.errors)); return j.data;
}
export async function chainInfo(f){return gql('{ chainIdentifier checkpoint { sequenceNumber } }',{},f);}
export async function balance(address, coinType='0x2::sui::SUI', f){
  const d=await gql('query($a:SuiAddress!,$c:String!){ address(address:$a){ balance(coinType:$c){ totalBalance } } }',{a:address,c:coinType},f);
  return BigInt(d.address?.balance?.totalBalance ?? 0);
}
// Settlements: incoming transfers of coinType to `to` since `sinceMs`, with sender address.
export async function settlements(to, {coinType=USDC, sinceMs=0, last=50}={}, f){
  const d=await gql(`query($a:SuiAddress!,$n:Int!){ transactions(last:$n, filter:{affectedAddress:$a}){ nodes { digest sender { address } effects { timestamp balanceChanges { nodes { owner { address } amount coinType { repr } } } } } } }`,{a:to,n:last},f);
  const norm=s=>s.replace(/^0x0*/,'');
  return d.transactions.nodes.flatMap(t=>t.effects.balanceChanges.nodes
    .filter(b=>b.owner?.address===to && norm(b.coinType.repr)===norm(coinType) && BigInt(b.amount)>0n && Date.parse(t.effects.timestamp)>=sinceMs)
    .map(b=>({digest:t.digest,from:t.sender?.address,amount:BigInt(b.amount),ts:t.effects.timestamp})));
}
