import {Tally,makeMemory} from './tally.mjs';
const t=new Tally(makeMemory());
await t.addExpense({payer:'Ana',amount:60,split:['Ana','Ben','Cy'],category:'groceries',note:'weekly shop'});
await t.addExpense({payer:'Ben',amount:30,split:['Ana','Ben','Cy'],category:'utilities',note:'internet'});
await t.learnLimit('groceries',250);
console.log('balances',t.balances());
const r=await t.ask('groceries limit');console.log('recall',r.length, JSON.stringify(r[0]).slice(0,150));
