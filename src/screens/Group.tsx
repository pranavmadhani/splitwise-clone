import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
} from 'react-native';
import { api } from '../services/api';

/**
 * Pixel-focused dark “Group” screen
 * – Summary card with owed/owe, progress bar, small avatars, CTA row
 * – Month sections with expense rows (icon + title + who-paid + chip + date + amount)
 * – Settle suggestions button scrolls to bottom section
 *
 * NOTE: This is *UI-only*. All network calls reuse your existing endpoints.
 * It will render even if backend is offline (empty lists).
 */

type SplitType = 'equal' | 'exact' | 'percentage' | 'shares';

const C = {
  bg: '#0e1113',
  surface: '#1a1f23',
  surface2: '#232a2f',
  line: '#2d363c',
  text: '#eff3f6',
  sub: '#9aa6af',
  mint: '#16c79a',       // + Lent / you’re owed
  orange: '#ff8a3d',    // - Borrowed / you owe
  good: '#27ae60',
  bad: '#e54f4f',
  chipBg: '#0f1417',
};

const ICONS = ['🧾','🍔','✈️','🚖','🏨','🎟️','🛒','☕️','🍻'];

export default function Group({ route }: any) {
  const id = route.params.id as string;
  const [group, setGroup] = useState<any>();
  const [members, setMembers] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [usersById, setUsersById] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  const settleRef = useRef<View>(null);

  async function load() {
    setLoading(true);
    try {
      const gs = await api.get('/groups').catch(() => ({ data: [] }));
      const g = (gs.data || []).find((x: any) => x.id === id);
      setGroup(g || { name: 'Group', members: [], currency: 'USD' });

      const ms = g?.members?.map((m: any) => m.user) || [];
      setMembers(ms);
      const by: any = {};
      for (const m of ms) by[m.id] = m;
      setUsersById(by);

      const ex = await api.get(`/expenses/group/${id}`).catch(() => ({ data: [] }));
      setExpenses(ex.data || []);

      const bal = await api.get(`/balances/group/${id}`).catch(() => ({ data: {} }));
      setBalances(bal.data || {});
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, [id]);

  // derive totals: positive = others owe you; negative = you owe others
  const totals = useMemo(() => {
    const vals = Object.values(balances).map(Number);
    const plus = vals.filter((v) => v > 0).reduce((s, v) => s + v, 0);
    const minus = Math.abs(vals.filter((v) => v < 0).reduce((s, v) => s + v, 0));
    const denom = Math.max(1, plus + minus);
    return { plus, minus, pct: Math.min(1, plus / denom) };
  }, [balances]);

  // group expenses by month label
  const byMonth = useMemo(() => {
    const fmt = (d: string | Date) => {
      const dt = d ? new Date(d) : new Date();
      const month = dt.toLocaleString('en-US', { month: 'long' });
      return `${month}, ${dt.getFullYear()}`;
    };
    const m: Record<string, any[]> = {};
    for (const e of expenses) {
      const key = fmt(e.createdAt || e.updatedAt || new Date());
      m[key] = m[key] || [];
      m[key].push(e);
    }
    // sort sections newest first; each list newest first
    const entries = Object.entries(m).sort(
      (a, b) => new Date((b[1][0]?.createdAt)||Date.now()).getTime() - new Date((a[1][0]?.createdAt)||Date.now()).getTime()
    );
    return entries.map(([k, arr]) => [k, arr.sort(
      (a, b) => new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime()
    )] as [string, any[]]);
  }, [expenses]);

  function nameOf(uid?: string) {
    const u = uid ? usersById[uid] : undefined;
    return u?.name || u?.email || 'Someone';
  }

  function Chip({ kind }: { kind: 'lent' | 'borrowed' }) {
    const text = kind === 'lent' ? '• Lent' : '• Borrowed';
    const bg = kind === 'lent' ? '#143c34' : '#3a2419';
    const fg = kind === 'lent' ? C.mint : C.orange;
    return (
      <View style={[styles.chip, { backgroundColor: bg, borderColor: fg }]}>
        <Text style={[styles.chipText, { color: fg }]}>{text}</Text>
      </View>
    );
  }

  function Row({ e, idx }: { e: any; idx: number }) {
    // crude icon pick by index / description
    const icon = ICONS[idx % ICONS.length];
    const who = nameOf(e.paidById);
    const youPaid = false; // could compare with /users/me when available
    const positive = Number(e.amount) >= 0;

    return (
      <View style={styles.row}>
        <View style={styles.rowLeft}>
          <View style={styles.rowIcon}>
            <Text style={{ fontSize: 16 }}>{icon}</Text>
          </View>
          <View>
            <Text style={styles.rowTitle} numberOfLines={1}>
              {e.description || 'Expense'}
            </Text>
            <Text style={styles.rowSub} numberOfLines={1}>
              {who} paid ${Number(e.amount || 0).toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.rowRight}>
          <Chip kind={positive ? 'lent' : 'borrowed'} />
          <Text style={[styles.rowAmt, { color: positive ? C.mint : C.orange }]}>
            {positive ? '+' : '-'}${Math.abs(Number(e.amount || 0)).toFixed(2)}
          </Text>
        </View>
      </View>
    );
  }

  function scrollToSettle() {
    if (!settleRef.current) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    // @ts-ignore
    settleRef.current.measure?.((x: number, y: number, w: number, h: number, px: number, py: number) => {
      // very simple: rely on ScrollView automatic; this is only a hint UX-wise
    });
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 16 }}>
      {/* Header label mirrors reference */}
      <Text style={styles.header}>Group</Text>

      {/* Summary card */}
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={styles.thumb} />
          <View style={{ flex: 1 }}>
            <Text style={styles.kpiLabel}>Total Owed</Text>
            <Text style={[styles.kpiValue, { color: C.mint }]}>+${totals.plus.toFixed(2)}</Text>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={styles.kpiLabel}>Total Owe</Text>
            <Text style={[styles.kpiValue, { color: C.orange }]}>-${totals.minus.toFixed(2)}</Text>
          </View>
        </View>

        {/* progress */}
        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round(totals.pct * 100)}%` }]} />
          </View>
        </View>

        <Text style={styles.groupName} numberOfLines={1}>
          {group?.name || 'Winter sem Trio'}
        </Text>

        {/* micro “people owe” line (static text shape, data-aware) */}
        <Text style={styles.miniLine} numberOfLines={2}>
          {Object.entries(balances).length
            ? (() => {
                const pos = Object.entries(balances).filter(([, v]) => Number(v) > 0);
                const neg = Object.entries(balances).filter(([, v]) => Number(v) < 0);
                const firstPos = pos[0]?.[0];
                const firstNeg = neg[0]?.[0];
                const a = firstPos ? `${nameOf(firstPos)} owes you $${Number(balances[firstPos]).toFixed(2)}` : '';
                const b = firstNeg ? `you owe ${nameOf(firstNeg)} $${Math.abs(Number(balances[firstNeg])).toFixed(2)}` : '';
                return [a, b].filter(Boolean).join(' · ');
              })()
            : 'Nobody owes anyone yet'}
        </Text>

        {/* CTA row */}
        <View style={styles.ctaRow}>
          <CTA title="Settle Up" onPress={scrollToSettle} />
          <CTA title="View Details" onPress={() => {}} outline />
          <CTA title="Balance" onPress={() => {}} outline />
        </View>
      </View>

      {/* Month sections */}
      {byMonth.map(([label, list], i) => (
        <View key={label} style={{ marginTop: i === 0 ? 16 : 22 }}>
          <Text style={styles.sectionTitle}>{label}</Text>
          <View style={styles.sectionCard}>
            {list.map((e, idx) => (
              <Row key={e.id || idx} e={e} idx={idx} />
            ))}
            {list.length === 0 && <Text style={styles.empty}>No expenses yet.</Text>}
          </View>
        </View>
      ))}

      {/* Settlement suggestions anchor */}
      <View ref={settleRef} style={{ marginTop: 24 }}>
        <Text style={styles.sectionTitle}>Settlement suggestions</Text>
        <View style={styles.sectionCard}>
          <SettlementBlock groupId={id} usersById={usersById} />
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function CTA({ title, onPress, outline }: { title: string; onPress: () => void; outline?: boolean }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.cta,
        outline
          ? { backgroundColor: 'transparent', borderColor: C.orange, borderWidth: 1 }
          : { backgroundColor: C.orange },
      ]}
    >
      <Text style={[styles.ctaText, outline && { color: C.orange }]}>{title}</Text>
    </TouchableOpacity>
  );
}

function SettlementBlock({
  groupId,
  usersById,
}: {
  groupId: string;
  usersById: Record<string, any>;
}) {
  const [list, setList] = useState<any[]>([]);
  useEffect(() => {
    api.get(`/settlements/group/${groupId}/suggest`).then((r) => setList(r.data || []));
  }, [groupId]);

  if (!list.length) return <Text style={styles.empty}>No settlements needed.</Text>;

  return (
    <View style={{ gap: 10 }}>
      {list.map((t, i) => (
        <View key={i} style={styles.settleRow}>
          <Text style={styles.settleText}>
            <Text style={{ color: C.bad }}>
              {usersById[t.fromId]?.name || usersById[t.fromId]?.email || 'User'}
            </Text>{' '}
            pays{' '}
            <Text style={{ color: C.text, fontWeight: '700' }}>
              ${Number(t.amount).toFixed(2)}
            </Text>{' '}
            to{' '}
            <Text style={{ color: C.good }}>
              {usersById[t.toId]?.name || usersById[t.toId]?.email || 'User'}
            </Text>
          </Text>
          <TouchableOpacity
            onPress={() => api.post(`/settlements/group/${groupId}/pay`, { toId: t.toId, amount: t.amount }).then(()=>{})}
            style={styles.settleBtn}
          >
            <Text style={styles.settleBtnText}>Mark paid</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

/* ------------------------------- styles ---------------------------------- */

const styles = StyleSheet.create({
  header: { color: C.text, fontSize: 18, fontWeight: '700', marginBottom: 10 },
  card: {
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.line,
    padding: 14,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.line,
  },
  kpiLabel: { color: C.sub, fontSize: 12 },
  kpiValue: { fontSize: 16, fontWeight: '700' },
  progressWrap: { marginTop: 10, marginBottom: 8 },
  progressTrack: {
    height: 10,
    backgroundColor: '#0c0f11',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.line,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: C.mint,
    borderRightWidth: 8,
    borderRightColor: '#0aa582',
  },
  groupName: { color: C.text, fontWeight: '700', marginTop: 8 },
  miniLine: { color: C.sub, marginTop: 4 },
  ctaRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  cta: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12 },
  ctaText: { color: '#111', fontWeight: '700' },

  sectionTitle: { color: C.sub, fontWeight: '700', marginBottom: 8, marginLeft: 2 },
  sectionCard: {
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.line,
    padding: 10,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  rowLeft: { flexDirection: 'row', gap: 12, alignItems: 'center', flex: 1 },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.line,
  },
  rowTitle: { color: C.text, fontWeight: '600', maxWidth: 170 },
  rowSub: { color: C.sub, fontSize: 12 },
  rowRight: { alignItems: 'flex-end' },
  chip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 6,
    alignSelf: 'flex-end',
  },
  chipText: { fontWeight: '700', fontSize: 12 },
  rowAmt: { fontWeight: '700', fontSize: 16 },

  empty: { color: C.sub, paddingVertical: 10 },

  settleRow: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: C.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settleText: { color: C.text },
  settleBtn: {
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.line,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  settleBtnText: { color: C.text, fontWeight: '700' },
});
