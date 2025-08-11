import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Title, Card, Input, Button } from '../ui';
import { theme } from '../theme';
import Icon from '../components/Icon';
import { offlineGroups } from '../services/offline';
import { all, run } from '../local/db'; // read payments/expenses directly

type FeedItem = {
  id: string;
  kind: 'expense' | 'payment';
  groupId: string;
  title: string;     // expense description OR “Payment”
  subtitle: string;  // who paid / who paid whom
  amount: number;    // >0 = credit to you, <0 = you paid
  createdAt: string;
  actors?: { fromId?: string; toId?: string; paidById?: string };
};

type Section = { title: string; data: FeedItem[] };

const COLORS = {
  credit: '#27ae60',
  debit: '#e54f4f',
  txt: theme.colors.text,
  sub: theme.colors.subtext,
  line: theme.colors.line,
  chip: '#F1F5F9',
};

/** Utility: date label buckets */
function dateBucket(dateISO: string) {
  const d = new Date(dateISO);
  const now = new Date();

  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
  const oneDay = 24 * 60 * 60 * 1000;
  const diffDays = (startOfDay(now).getTime() - startOfDay(d).getTime()) / oneDay;

  if (diffDays <= 0) return 'Today';
  if (diffDays <= 1) return 'Yesterday';

  // This Week / This Month
  const sameWeek = (a: Date, b: Date) => {
    const ad = new Date(a); ad.setHours(0,0,0,0);
    const bd = new Date(b); bd.setHours(0,0,0,0);
    const aDay = (ad.getDay() + 6) % 7; // make Monday=0
    const bDay = (bd.getDay() + 6) % 7;
    const aMon = new Date(ad); aMon.setDate(ad.getDate() - aDay);
    const bMon = new Date(bd); bMon.setDate(bd.getDate() - bDay);
    return aMon.getFullYear() === bMon.getFullYear() && aMon.getMonth() === bMon.getMonth() && aMon.getDate() === bMon.getDate();
  };
  if (sameWeek(d, now)) return 'This week';

  if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) return 'This month';

  return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

export default function Activity({ navigation }: any) {
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
  const [groupId, setGroupId] = useState<string | 'all'>('all');
  const [type, setType] = useState<'all' | 'expenses' | 'payments'>('all');
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [feed, setFeed] = useState<FeedItem[]>([]);

  const load = useCallback(async () => {
    // groups for filter
    const gs = await offlineGroups.list();
    setGroups(gs.map((g: any) => ({ id: g.id, name: g.name })));

    // Build feed from local DB
    // expenses
    const exRows = await all<any>(`
      SELECT e.id, e.groupId, e.description, e.amount, e.paidById, e.createdAt, g.name as groupName
      FROM expenses e
      JOIN groups g ON g.id = e.groupId
      ORDER BY datetime(e.createdAt) DESC
    `);

    // payments
    const payRows = await all<any>(`
      SELECT p.id, p.groupId, p.fromId, p.toId, p.amount, p.createdAt, g.name as groupName
      FROM payments p
      JOIN groups g ON g.id = p.groupId
      ORDER BY datetime(p.createdAt) DESC
    `);

    const mapExpense = (r: any): FeedItem => ({
      id: r.id,
      kind: 'expense',
      groupId: r.groupId,
      title: r.description,
      subtitle: `${r.groupName} • Paid by ${String(r.paidById).slice(0, 6)}…`,
      amount: r.amount, // display raw; per-user balance is on balances screen
      createdAt: r.createdAt,
      actors: { paidById: r.paidById },
    });

    const mapPayment = (r: any): FeedItem => ({
      id: r.id,
      kind: 'payment',
      groupId: r.groupId,
      title: 'Payment',
      subtitle: `${r.groupName} • ${String(r.fromId).slice(0, 6)}… → ${String(r.toId).slice(0, 6)}…`,
      amount: r.amount,
      createdAt: r.createdAt,
      actors: { fromId: r.fromId, toId: r.toId },
    });

    const combined = [...exRows.map(mapExpense), ...payRows.map(mapPayment)];
    combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setFeed(combined);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const filtered = useMemo(() => {
    let list = feed;
    if (groupId !== 'all') list = list.filter((x) => x.groupId === groupId);
    if (type === 'expenses') list = list.filter((x) => x.kind === 'expense');
    if (type === 'payments') list = list.filter((x) => x.kind === 'payment');
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (x) =>
          x.title.toLowerCase().includes(q) ||
          x.subtitle.toLowerCase().includes(q),
      );
    }
    // group into sections
    const bucketMap = new Map<string, FeedItem[]>();
    for (const it of list) {
      const k = dateBucket(it.createdAt);
      if (!bucketMap.has(k)) bucketMap.set(k, []);
      bucketMap.get(k)!.push(it);
    }
    return Array.from(bucketMap.entries())
      .map(([title, data]) => ({ title, data }))
      .sort((a, b) => {
        // sort sections by most recent item inside
        const at = new Date(a.data[0]?.createdAt || 0).getTime();
        const bt = new Date(b.data[0]?.createdAt || 0).getTime();
        return bt - at;
      });
  }, [feed, groupId, type, query]);

  async function deleteExpense(id: string) {
    await run('DELETE FROM expense_shares WHERE expenseId=?', [id]);
    await run('DELETE FROM expenses WHERE id=?', [id]);
    await onRefresh();
  }
  async function deletePayment(id: string) {
    await run('DELETE FROM payments WHERE id=?', [id]);
    await onRefresh();
  }

  const renderItem = ({ item }: { item: FeedItem }) => {
    const isExpense = item.kind === 'expense';
    return (
      <View style={styles.row}>
        <View style={styles.rowLeft}>
          <View style={[styles.avatar, { backgroundColor: isExpense ? '#E8F9F2' : '#FFF5F3' }]}>
            <Icon type={isExpense ? 'feather' : 'ion'} name={isExpense ? 'shopping-bag' : 'swap-horizontal'} size={16} color={isExpense ? COLORS.credit : COLORS.debit} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.sub}>{item.subtitle}</Text>
            <View style={styles.chips}>
              <Chip text={isExpense ? 'Expense' : 'Payment'} tone={isExpense ? 'green' : 'red'} />
              <Chip text={new Date(item.createdAt).toLocaleString()} />
            </View>
          </View>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.amount, { color: item.amount >= 0 ? COLORS.credit : COLORS.debit }]}>
            {item.amount >= 0 ? '+' : '-'}${Math.abs(item.amount).toFixed(2)}
          </Text>
          <View style={{ height: 6 }} />
          <View style={styles.rowActions}>
            <TouchableOpacity onPress={() => (isExpense ? deleteExpense(item.id) : deletePayment(item.id))} style={styles.actionBtn}>
              <Icon type="feather" name="trash-2" size={16} color={COLORS.debit} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderSectionHeader = ({ section }: { section: Section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  );

  return (
    <View style={styles.wrap}>
      <Title>Activity</Title>
      <View style={{ height: 10 }} />
      <Card>
        {/* search + filters */}
        <View style={styles.filters}>
          <View style={styles.searchBox}>
            <Icon type="ion" name="search-outline" size={18} color={COLORS.sub} />
            <Input
              style={{ flex: 1 }}
              placeholder="Search by title or group"
              value={query}
              onChangeText={setQuery}
            />
          </View>

          <View style={styles.rowFilter}>
            <Toggle active={type === 'all'} label="All" onPress={() => setType('all')} />
            <Toggle active={type === 'expenses'} label="Expenses" onPress={() => setType('expenses')} />
            <Toggle active={type === 'payments'} label="Payments" onPress={() => setType('payments')} />
          </View>

          {/* Group dropdown (simple pills) */}
          <View style={styles.groupsWrap}>
            <ScrollChips
              items={[{ id: 'all', name: 'All groups' }, ...groups]}
              value={groupId}
              onChange={setGroupId}
            />
          </View>
        </View>

        <SectionList
          sections={filtered as Section[]}
          keyExtractor={(it) => it.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={{ paddingVertical: 24 }}>
              <Text style={styles.sub}>No activity yet.</Text>
            </View>
          }
        />
      </Card>
    </View>
  );
}

/* ───────── mini components ───────── */

function Chip({ text, tone }: { text: string; tone?: 'green' | 'red' }) {
  const bg = tone === 'green' ? '#E8F9F2' : tone === 'red' ? '#FFF5F3' : COLORS.chip;
  const fg = tone === 'green' ? COLORS.credit : tone === 'red' ? COLORS.debit : COLORS.sub;
  return (
    <View style={[styles.chip, { backgroundColor: bg, borderColor: fg }]}>
      <Text style={[styles.chipText, { color: fg }]}>{text}</Text>
    </View>
  );
}

function Toggle({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.toggle, active && styles.toggleActive]}>
      <Text style={[styles.toggleText, active && styles.toggleTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function ScrollChips({
  items,
  value,
  onChange,
}: {
  items: { id: string; name: string }[];
  value: string | 'all';
  onChange: (v: any) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {items.map((g) => {
        const active = value === g.id;
        return (
          <TouchableOpacity
            key={g.id}
            onPress={() => onChange(g.id)}
            style={[
              styles.groupChip,
              { backgroundColor: active ? theme.colors.brand : '#fff', borderColor: COLORS.line },
            ]}
          >
            <Text style={{ color: active ? '#fff' : COLORS.txt, fontWeight: '700' }}>{g.name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/* ───────── styles ───────── */

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#fff', padding: 16 },
  filters: { gap: 12, marginBottom: 10 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 44,
  },
  rowFilter: { flexDirection: 'row', gap: 8 },
  toggle: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  toggleActive: { backgroundColor: theme.colors.brand, borderColor: theme.colors.brand },
  toggleText: { color: theme.colors.text, fontWeight: '600' },
  toggleTextActive: { color: '#fff' },

  groupsWrap: { marginTop: 2 },

  sectionHeader: {
    paddingTop: 12,
    paddingBottom: 6,
    borderTopWidth: 1,
    borderTopColor: theme.colors.line,
  },
  sectionHeaderText: { color: theme.colors.subtext, fontWeight: '700' },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopColor: theme.colors.line,
    borderTopWidth: 1,
  },
  rowLeft: { flexDirection: 'row', gap: 12, flex: 1 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  title: { color: theme.colors.text, fontWeight: '700' },
  sub: { color: theme.colors.subtext, marginTop: 2 },
  chips: { flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' },
  chip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: { fontWeight: '700', fontSize: 12 },
  amount: { color: theme.colors.text, fontWeight: '800' },
  rowActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: '#fff',
  },

  // 🔥 missing before — now added
  groupChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
  },
});
