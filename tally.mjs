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
