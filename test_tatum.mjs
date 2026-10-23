import assert from 'assert'; import {settlements,USDC} from './tatum.mjs'; import {Tally,makeMemory} from './tally.mjs';
process.env.TATUM_API_KEY ??= 'test';
const G='0xaa', A='0xbb';
const fake=async()=>({json:async()=>({data:{transactions:{nodes:[{digest:'D1',sender:{address:A},effects:{timestamp:'2026-10-24T00:00:00Z',balanceChanges:{nodes:[{owner:{address:G},amount:'20000000',coinType:{repr:USDC}},{owner:{address:A},amount:'-20000000',coinType:{repr:USDC}}]}}}]}}})});
const s=await settlements(G,{},fake); assert.equal(s.length,1); assert.equal(s[0].amount,20000000n);
const t=new Tally(makeMemory()); await t.addExpense({payer:'Ana',amount:60,split:['Ana','Cy','Ben'],category:'groceries',note:'shop'});
const d=await t.reconcile(G,{Cy:A},{fetch:fake,payee:'Ana'}); assert.equal(d[0].usd,20);
assert.equal(t.balances().Cy,0); console.log('unit ok');
if(process.env.TATUM_LIVE){const {chainInfo,balance}=await import('./tatum.mjs');const c=await chainInfo();assert.equal(c.chainIdentifier,'4btiuiMPvEENsttpZC7CZ53DruC3MAgfznDbASZ7DR6S');
 console.log('live ok checkpoint',c.checkpoint.sequenceNumber,'bal',await balance('0x2ecff694728d1d390ab2a8915fcf3e6c98533b2314f58f59e90d0934a07951a7'));}
