// src/services/offline.ts
import {
  addExpense,
  addMember,
  balancesByGroup,
  boot,
  createGroup,
  groupWithMembers,
  listExpenses,
  listGroups,
  loginLocal,
  markPaid,
  meLocal,
  registerLocal,
  suggestSettlements,
} from '../local/repo';

export async function initOffline() { await boot(); }

export const offlineAuth = {
  async register({ email, name, password }:{ email:string; name:string; password:string }) {
    return registerLocal(email, name, password);
  },
  async login({ email, password }:{ email:string; password:string }) {
    return loginLocal(email, password);
  },
  async me(){ return meLocal(); }
};

export const offlineGroups = {
  list: listGroups,
  create: createGroup,
  members: groupWithMembers,
  addMember: (groupId:string, userId:string)=> addMember(groupId, userId),
};

export const offlineExpenses = {
  listByGroup: listExpenses,
  add: addExpense,
  balances: balancesByGroup,
  suggest: suggestSettlements,
  markPaid: (groupId:string, toId:string, amount:number, fromId:string)=> markPaid(groupId, fromId, toId, amount),
};
