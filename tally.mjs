// Tally: shared budget + spend tracker that learns. Memory layer = Walrus Memory (MemWal).
import { MemWal, MemWalMock } from '@mysten-incubation/memwal';
export function makeMemory(){
  if(process.env.MEMWAL_KEY && process.env.MEMWAL_ACCOUNT_ID)
    return MemWal.create({key:process.env.MEMWAL_KEY,accountId:process.env.MEMWAL_ACCOUNT_ID,
      serverUrl:process.env.MEMWAL_SERVER_URL??'https://relayer-staging.memory.walrus.xyz',namespace:'tally-group'});
  return MemWalMock.create({namespace:'tally-group'});
}
export class Tally{
  constructor(mem){this.mem=mem;this.ledger=[];}
  async addExpense({payer,amount,split,category,note}){
    const e={payer,amount,split,category,note,ts:Date.now()};this.ledger.push(e);
    await this.mem.rememberAndWait(`Expense: ${payer} paid ${amount} USD for ${category} (${note}), split among ${split.join(', ')}.`,undefined,{timeoutMs:60000});
    return e;}
  balances(){const b={};for(const e of this.ledger){const s=e.amount/e.split.length;b[e.payer]=(b[e.payer]||0)+e.amount;for(const p of e.split)b[p]=(b[p]||0)-s;}return b;}
  async learnLimit(category,limit){await this.mem.rememberAndWait(`Learned preference: group monthly limit for ${category} is ${limit} USD.`,undefined,{timeoutMs:60000});}
  async ask(q){return (await this.mem.recall({query:q,limit:5})).results??[];}
}
// Close debts automatically when an on-chain USDC repayment (read via Tatum) arrives.
import { settlements } from './tatum.mjs';
Tally.prototype.reconcile = async function(groupAddr, walletOf, opts={}){
  const paid=await settlements(groupAddr, opts, opts.fetch); const done=[];
  for(const s of paid){const who=Object.keys(walletOf).find(k=>walletOf[k]===s.from); if(!who) continue;
    const usd=Number(s.amount)/1e6; this.ledger.push({payer:who,amount:usd,split:[opts.payee??'group'],category:'settlement',note:s.digest});
    await this.mem.rememberAndWait(`Settlement: ${who} repaid ${usd} USDC on Sui (tx ${s.digest}).`,undefined,{timeoutMs:60000}); done.push({who,usd,tx:s.digest});}
  return done;
};
