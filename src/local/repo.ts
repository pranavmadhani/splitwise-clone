// src/local/repo.ts
import { all, cuid, get, initDB, run } from './db';

type SplitType = 'equal' | 'exact' | 'percentage' | 'shares';

export async function boot() {
  await initDB();
  // seed demo account if empty
  const me = await get<{ v: string }>('SELECT v FROM me WHERE k="userId"');
  const users = await all('SELECT id FROM users');
  if (!me && users.length === 0) {
    const uid = cuid();
    await run('INSERT INTO users (id,email,name,password) VALUES (?,?,?,?)', [
      uid, 'you@example.com', 'You', 'pass',
    ]);
    await run('INSERT INTO me (k,v) VALUES ("userId", ?)', [uid]);
  }
}

/* AUTH (local only) */
export async function registerLocal(email: string, name: string, password: string) {
  const exists = await get('SELECT id FROM users WHERE email=?', [email]);
  if (exists) throw new Error('Email already exists');
  const id = cuid();
  await run('INSERT INTO users (id,email,name,password) VALUES (?,?,?,?)', [id, email, name, password]);
  await run('INSERT OR REPLACE INTO me (k,v) VALUES ("userId", ?)', [id]);
  return { id };
}

export async function loginLocal(email: string, password: string) {
  const u = await get<{ id: string }>('SELECT id FROM users WHERE email=? AND password=?', [email, password]);
  if (!u) throw new Error('Invalid credentials');
  await run('INSERT OR REPLACE INTO me (k,v) VALUES ("userId", ?)', [u.id]);
  return { id: u.id };
}

export async function meLocal() {
  const m = await get<{ v: string }>('SELECT v FROM me WHERE k="userId"');
  if (!m) return null;
  const u = await get('SELECT id,email,name FROM users WHERE id=?', [m.v]);
  return u;
}

/* USERS */
export async function userById(id: string) {
  return get('SELECT id,email,name FROM users WHERE id=?', [id]);
}

/* GROUPS */
export async function listGroups() {
  const gs = await all('SELECT id,name,currency FROM groups ORDER BY name');
  // attach members (shape similar to server: members:[{user:{...}}])
  const res: any[] = [];
  for (const g of gs) {
    const ms = await all<{ userId: string }>('SELECT userId FROM group_members WHERE groupId=?', [g.id]);
    const members = [];
    for (const m of ms) {
      const user = await userById(m.userId);
      if (user) members.push({ user });
    }
    res.push({ ...g, members });
  }
  return res;
}

export async function createGroup(name: string, currency = 'USD') {
  const id = cuid();
  await run('INSERT INTO groups (id,name,currency) VALUES (?,?,?)', [id, name, currency]);
  // add me as member
  const me = await meLocal();
  if (me) {
    await run('INSERT INTO group_members (id,groupId,userId) VALUES (?,?,?)', [cuid(), id, me.id]);
  }
  return { id, name, currency };
}

export async function addMember(groupId: string, userId: string) {
  await run('INSERT INTO group_members (id,groupId,userId) VALUES (?,?,?)', [cuid(), groupId, userId]);
}

/* EXPENSES */
export async function listExpenses(groupId: string) {
  return all('SELECT * FROM expenses WHERE groupId=? ORDER BY datetime(createdAt) DESC', [groupId]);
}

export async function addExpense(input: {
  groupId: string;
  description: string;
  amount: number;
  paidById: string;
  split: { splitType: SplitType; parts: { userId: string; value: number }[] };
}) {
  const id = cuid();
  const createdAt = new Date().toISOString();
  await run(
    'INSERT INTO expenses (id,groupId,description,amount,paidById,splitType,createdAt) VALUES (?,?,?,?,?,?,?)',
    [id, input.groupId, input.description, input.amount, input.paidById, input.split.splitType, createdAt]
  );
  for (const p of input.split.parts) {
    await run(
      'INSERT INTO expense_shares (id,expenseId,userId,value) VALUES (?,?,?,?)',
      [cuid(), id, p.userId, p.value]
    );
  }
  return { id };
}

/* BALANCES */
export async function balancesByGroup(groupId: string): Promise<Record<string, number>> {
  const bal: Record<string, number> = {};
  const members = await all<{ userId: string }>('SELECT userId FROM group_members WHERE groupId=?', [groupId]);
  members.forEach(m => (bal[m.userId] = 0));

  const rows = await all<any>('SELECT * FROM expenses WHERE groupId=?', [groupId]);
  for (const e of rows) {
    const shares = await all<{ userId: string; value: number }>('SELECT userId,value FROM expense_shares WHERE expenseId=?', [e.id]);
    const total = Number(e.amount);
    if (e.splitType === 'equal') {
      const per = total / members.length;
      for (const m of members) {
        const u = m.userId;
        // paidBy gets credited, each member owes per
        bal[u] -= per;
      }
      bal[e.paidById] += total; // they fronted the cash
    } else if (e.splitType === 'exact') {
      for (const s of shares) {
        bal[s.userId] -= s.value;
      }
      bal[e.paidById] += total;
    } else if (e.splitType === 'percentage') {
      for (const s of shares) {
        bal[s.userId] -= (s.value / 100) * total;
      }
      bal[e.paidById] += total;
    } else if (e.splitType === 'shares') {
      const sumShares = shares.reduce((a, b) => a + (b.value || 0), 0) || 1;
      for (const s of shares) {
        bal[s.userId] -= (s.value / sumShares) * total;
      }
      bal[e.paidById] += total;
    }
  }

  // apply payments
  const pays = await all<any>('SELECT * FROM payments WHERE groupId=?', [groupId]);
  for (const p of pays) {
    bal[p.fromId] -= Number(p.amount);
    bal[p.toId] += Number(p.amount);
  }

  // round to cents
  for (const k of Object.keys(bal)) bal[k] = Math.round(bal[k] * 100) / 100;
  return bal;
}

/* SETTLEMENT SUGGESTIONS (min-cash-flow-ish greedy) */
export async function suggestSettlements(groupId: string) {
  const bal = await balancesByGroup(groupId);
  const debtors: { id: string; v: number }[] = [];
  const creditors: { id: string; v: number }[] = [];
  for (const [id, v] of Object.entries(bal)) {
    if (v < -0.009) debtors.push({ id, v: -v });  // owes
    else if (v > 0.009) creditors.push({ id, v }); // is owed
  }
  debtors.sort((a,b)=>b.v-a.v);
  creditors.sort((a,b)=>b.v-a.v);

  const xfers: { fromId: string; toId: string; amount: number }[] = [];
  let i=0, j=0;
  while (i<debtors.length && j<creditors.length) {
    const pay = Math.min(debtors[i].v, creditors[j].v);
    xfers.push({ fromId: debtors[i].id, toId: creditors[j].id, amount: Math.round(pay*100)/100 });
    debtors[i].v -= pay; creditors[j].v -= pay;
    if (debtors[i].v <= 0.009) i++;
    if (creditors[j].v <= 0.009) j++;
  }
  return xfers;
}

export async function markPaid(groupId: string, fromId: string, toId: string, amount: number) {
  await run(
    'INSERT INTO payments (id,groupId,fromId,toId,amount,createdAt) VALUES (?,?,?,?,?,?)',
    [cuid(), groupId, fromId, toId, amount, new Date().toISOString()]
  );
}

/* UTIL */
export async function groupWithMembers(id: string) {
  const g = await get('SELECT id,name,currency FROM groups WHERE id=?', [id]);
  if (!g) return null;
  const ms = await all<{ userId: string }>('SELECT userId FROM group_members WHERE groupId=?', [id]);
  const members = [];
  for (const m of ms) {
    const user = await userById(m.userId);
    if (user) members.push({ user });
  }
  return { ...g, members };
}
