// Lightweight in-memory mock so the app is fully browsable without backend.

const now = Date.now();

export const users: any[] = [
  { id: 'u_me', name: 'You' },
  { id: 'u_1', name: 'Sumit Sinha' },
  { id: 'u_2', name: 'Prasad Yash Raj' },
  { id: 'u_3', name: 'Mruthunjai' },
  { id: 'u_4', name: 'Jagrit Pant' },
  { id: 'u_5', name: 'Ritika Bhardwaj' },
];

export const groups: any[] = [
  { id: 'g1', name: 'Winter sem Trio', cover: 'https://picsum.photos/seed/win/100/100', status: 'you are Owed $95.00', delta: +95.0 },
  { id: 'g2', name: 'Goa Trip', cover: 'https://picsum.photos/seed/goa/100/100', status: 'you Owe $54.00', delta: -54.0 },
  { id: 'g3', name: 'Experiential Trip Expenses', cover: 'https://picsum.photos/seed/exp/100/100', status: 'Settled Up', delta: 0 },
];

const groupMembers: Record<string, any[]> = {
  g1: [users[0], users[1], users[2]],
  g2: [users[0], users[3], users[4]],
  g3: [users[0], users[1], users[4]],
};

export let expenses: any[] = [
  { id: 'e1', groupId: 'g1', description: 'PDC printout', amount: 30, paidById: 'u_me', paidByName: 'You', youLent: true, youBorrowed: false, createdAt: now - 1000 * 60 * 60 * 3, status: 'Owe' },
  { id: 'e2', groupId: 'g1', description: "Haldiram's Snacks", amount: 26.32, paidById: 'u_1', paidByName: 'Sumit', youBorrowed: true, youLent: false, createdAt: now - 1000 * 60 * 60 * 4, status: 'Owed' },
  { id: 'e3', groupId: 'g1', description: 'Train Tickets', amount: 1254.84, paidById: 'u_2', paidByName: 'Yash', youBorrowed: false, youLent: false, createdAt: now - 1000 * 60 * 60 * 5, status: 'Settled' },
  { id: 'e4', groupId: 'g2', description: 'Hotel Trip', amount: 854, paidById: 'u_me', paidByName: 'You', youLent: true, youBorrowed: false, createdAt: now - 1000 * 60 * 60 * 24, status: 'Owe' },
];

export let activity: any[] = [
  { id: 'a1', ts: now - 1000 * 60 * 10, who: 'Sumit', text: 'PDC printout', note: 'You added', direction: 'in', amount: 30, status: 'Owe' },
  { id: 'a2', ts: now - 1000 * 60 * 60, who: 'Sumit', text: "Haldiram's Snacks", note: 'Sumit added', direction: 'out', amount: 26.32, status: 'Owed' },
  { id: 'a3', ts: now - 1000 * 60 * 120, who: 'Yash', text: 'Train Tickets', note: 'Yash added', direction: 'in', amount: 1254.84, status: 'Settled' },
];

export const getUser = (id: string) => users.find((u) => u.id === id);

export const listGroups = () => groups;
export const getGroup = (id: string) => groups.find((g) => g.id === id);
export const listGroupMembers = (id: string) => groupMembers[id] || [users[0]];

export const listExpensesByGroup = (id: string) =>
  expenses
    .filter((e) => e.groupId === id)
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt));

export const createExpense = (input: {
  groupId: string; description: string; amount: number; paidById: string;
}) => {
  const paidByName = getUser(input.paidById)?.name ?? 'You';
  const youLent = input.paidById === 'u_me';
  const youBorrowed = !youLent;
  const status = youLent ? 'Owe' : 'Owed';

  const exp = {
    id: 'e' + ((Math.random() * 1e6) | 0),
    groupId: input.groupId,
    description: input.description,
    amount: Number(input.amount),
    paidById: input.paidById,
    paidByName,
    youLent,
    youBorrowed,
    createdAt: Date.now(),
    status,
  };
  expenses.unshift(exp);

  activity.unshift({
    id: 'a' + ((Math.random() * 1e6) | 0),
    ts: Date.now(),
    who: paidByName,
    text: input.description,
    note: 'Added',
    direction: youLent ? 'in' : 'out',
    amount: Number(input.amount),
    status,
  });
};

export const getGroupSummary = (id: string) => {
  const ex = expenses.filter((e) => e.groupId === id);
  const totalIn = ex.filter((e) => e.youLent).reduce((s, e) => s + Number(e.amount), 0);
  const totalOut = ex.filter((e) => e.youBorrowed).reduce((s, e) => s + Number(e.amount), 0);
  return { totalIn, totalOut };
};

export const suggestSettlements = (_: string) => [
  { fromId: 'u_2', toId: 'u_me', amount: 95.0 },
];

export const getDashboardSummary = () => {
  const totalIn = expenses.filter((e) => e.youLent).reduce((s, e) => s + Number(e.amount), 0);
  const totalOut = expenses.filter((e) => e.youBorrowed).reduce((s, e) => s + Number(e.amount), 0);
  return { in: totalIn, out: totalOut };
};

export const listActivity = () => activity;

export const listFriends = () =>
  users.slice(1).map((u, i) => ({
    id: u.id,
    name: u.name,
    delta: [+28.95, +91.55, -45.88, +28.95, +91.55][i % 5],
  }));

export const friendsSummary = () => {
  const list = listFriends();
  const inSum = list.filter((f) => f.delta > 0).reduce((s, f) => s + Number(f.delta), 0);
  const outSum = list.filter((f) => f.delta < 0).reduce((s, f) => s + Math.abs(Number(f.delta)), 0);
  return { in: inSum, out: outSum };
};

export const recordPayment = (groupId: string, fromId: string, toId: string, amount: number) => {
  const from = getUser(fromId)?.name ?? 'User';
  const to = getUser(toId)?.name ?? 'User';
  activity.unshift({
    id: 'a' + ((Math.random() * 1e6) | 0),
    ts: Date.now(),
    who: from,
    text: `Paid ${to}`,
    note: 'Settlement',
    direction: 'out',
    amount: Number(amount),
    status: 'Settled',
  });
};

// Accept optional 2nd arg to match existing call sites (e.g., createGroup(name, something))
export const createGroup = (name: string, cover?: string) => {
  const g = {
    id: 'g' + ((Math.random() * 1e6) | 0),
    name,
    cover: cover || `https://picsum.photos/seed/${encodeURIComponent(name)}/100/100`,
    status: 'New group',
    delta: 0,
  };
  groups.unshift(g);
  return g;
};
