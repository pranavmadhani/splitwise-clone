import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { theme } from '../theme';
import { offlineAuth, offlineExpenses, offlineGroups } from '../services/offline';
import { all } from '../local/db';

const mint = '#18C29C';
const orange = '#F47A2A';
const bg = '#0F141A';
const card = '#1A232C';
const card2 = '#242F3A';
const line = '#0E1217';
const text = '#DEE5ED';
const textDim = '#9AA6B2';
const red = '#e54f4f';
const green = '#27ae60';

type PreviewItem = {
  id: string;
  kind: 'expense' | 'payment';
  title: string;
  subtitle: string;
  amount: number;
};

export default function Home({ navigation }: any) {
  const [me, setMe] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [totals, setTotals] = useState({ owed: 0, owe: 0 });
  const [preview, setPreview] = useState<PreviewItem[]>([]);

  useEffect(() => {
    (async () => {
      const _me = await offlineAuth.me();
      setMe(_me);
      const gs = await offlineGroups.list();
      setGroups(gs);

      // compute totals across all groups for current user
      let owed = 0;
      let owe = 0;
      for (const g of gs) {
        const bal = await offlineExpenses.balances(g.id);
        const my = bal[_me?.id];
        if (typeof my === 'number') {
          if (my > 0) owed += my;
          if (my < 0) owe += Math.abs(my);
        }
      }
      setTotals({ owed: round2(owed), owe: round2(owe) });

      // preview feed: last 6 combined items
      const ex = await all<any>(`
        SELECT e.id, e.description, e.amount, e.createdAt, g.name as groupName
        FROM expenses e JOIN groups g ON g.id=e.groupId
        ORDER BY datetime(e.createdAt) DESC LIMIT 6
      `);
      const pays = await all<any>(`
        SELECT p.id, p.amount, p.createdAt, g.name as groupName, p.fromId, p.toId
        FROM payments p JOIN groups g ON g.id=p.groupId
        ORDER BY datetime(p.createdAt) DESC LIMIT 6
      `);
      const items: PreviewItem[] = [
        ...ex.map((r) => ({
          id: `e_${r.id}`,
          kind: 'expense' as const,
          title: r.description,
          subtitle: r.groupName,
          amount: Number(r.amount),
        })),
        ...pays.map((r) => ({
          id: `p_${r.id}`,
          kind: 'payment' as const,
          title: 'Payment',
          subtitle: `${r.groupName} • ${String(r.fromId).slice(0,6)}… → ${String(r.toId).slice(0,6)}…`,
          amount: Number(r.amount),
        })),
      ].sort(() => 0.5 - Math.random()) // quick shuffle for variety
       .slice(0, 6);
      setPreview(items);
    })();
  }, []);

  const ratio = useMemo(() => {
    const denom = totals.owed + totals.owe || 1;
    return totals.owed / denom;
  }, [totals]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top bar */}
      <View style={styles.topbar}>
        <View style={{ width: 28 }} />
        <Text style={styles.title}>Dashboard</Text>
        <View style={styles.actions}>
          <View style={styles.bubble}>
            <Icon type="feather" name="search" size={18} color={text} />
          </View>
          <View style={[styles.bubble, { marginLeft: 12 }]}>
            <Icon type="ion" name="notifications-outline" size={19} color={text} />
          </View>
        </View>
      </View>

      <FlatList
        ListHeaderComponent={
          <>
            {/* Totals card */}
            <View style={styles.totalsCard}>
              <View style={styles.totalsRow}>
                <View>
                  <Text style={styles.totalsLabel}>Total Owed</Text>
                  <Text style={[styles.totalsValue, { color: mint }]}>+${totals.owed.toFixed(2)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.totalsLabel}>Total Owe</Text>
                  <Text style={[styles.totalsValue, { color: orange }]}>-${totals.owe.toFixed(2)}</Text>
                </View>
              </View>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.min(100, Math.max(0, ratio * 100))}%` }]} />
              </View>

              <View style={styles.ctaRow}>
                <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Groups')}>
                  <Text style={styles.primaryBtnText}>Settle Up</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.outlineBtn]} onPress={() => navigation.navigate('Groups')}>
                  <Text style={[styles.outlineText]}>View Details</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.outlineBtn]} onPress={() => navigation.navigate('Groups')}>
                  <Text style={styles.outlineText}>Balance</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Groups header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your groups</Text>
              <TouchableOpacity style={styles.addPill} onPress={() => navigation.navigate('Groups')}>
                <Text style={styles.addPillText}>Add+</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        data={groups}
        keyExtractor={(g) => g.id}
        contentContainerStyle={{ paddingBottom: 28 }}
        renderItem={({ item }) => <GroupRow item={item} navigation={navigation} me={me} />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        style={{ paddingHorizontal: 18 }}
        ListFooterComponent={
          <View style={{ marginTop: 18 }}>
            <Text style={[styles.sectionTitle, { marginLeft: 0 }]}>Recent activity</Text>
            <View style={styles.recentCard}>
              {preview.length === 0 && <Text style={{ color: textDim }}>No recent items.</Text>}
              {preview.map((p) => (
                <View key={p.id} style={styles.recentRow}>
                  <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', flex: 1 }}>
                    <View style={styles.recentIcon}>
                      <Icon
                        type={p.kind === 'expense' ? 'feather' : 'ion'}
                        name={p.kind === 'expense' ? 'shopping-bag' : 'swap-horizontal'}
                        size={16}
                        color={p.kind === 'expense' ? green : red}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: text, fontWeight: '700' }} numberOfLines={1}>
                        {p.title}
                      </Text>
                      <Text style={{ color: textDim }} numberOfLines={1}>
                        {p.subtitle}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ color: p.amount >= 0 ? green : red, fontWeight: '800' }}>
                    {p.amount >= 0 ? '+' : '-'}${Math.abs(p.amount).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function GroupRow({ item, navigation, me }: any) {
  const [rightText, rightColor] = React.useMemo(() => {
    // derive per-group balance for current user
    const [val, setVal] = React.useState<number | null>(null);
    React.useEffect(() => {
      (async () => {
        const bal = await offlineExpenses.balances(item.id);
        const my = me?.id ? bal[me.id] : 0;
        setVal(typeof my === 'number' ? my : 0);
      })();
    }, [item?.id, me?.id]);

    return [
      val !== null
        ? `${val >= 0 ? '+' : '-'}$${Math.abs(val).toFixed(2)}`
        : '+$0.00',
      val !== null ? (val >= 0 ? green : red) : textDim,
    ] as const;
  }, [item.id, me?.id]);

  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.groupRow} onPress={() => navigation.navigate('Group', { id: item.id })}>
      <View style={styles.thumb}>
        <Text style={{ color: text, fontWeight: '700' }}>{item.name.charAt(0).toUpperCase()}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={styles.groupTitle}>
          {item.name}
        </Text>
        <Text numberOfLines={1} style={styles.groupSub}>
          {item.currency}
        </Text>
      </View>

      <Text style={[styles.groupRight, { color: rightColor as any }]}>{rightText}</Text>
    </TouchableOpacity>
  );
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: bg },
  topbar: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { color: text, fontSize: 26, fontWeight: '700' },
  actions: { flexDirection: 'row', alignItems: 'center' },
  bubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: card,
    alignItems: 'center',
    justifyContent: 'center',
  },

  totalsCard: {
    backgroundColor: card,
    borderRadius: 22,
    padding: 16,
    marginHorizontal: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  totalsLabel: { color: textDim, fontSize: 14, marginBottom: 4 },
  totalsValue: { fontSize: 22, fontWeight: '700' },

  progressTrack: {
    height: 12,
    backgroundColor: card2,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: mint,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },

  ctaRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  primaryBtn: {
    backgroundColor: mint,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  primaryBtnText: { color: '#0C1217', fontWeight: '700', fontSize: 16 },

  outlineBtn: {
    borderWidth: 1.5,
    borderColor: orange,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  outlineText: { color: orange, fontWeight: '700' },

  sectionHeader: {
    paddingHorizontal: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { color: text, fontSize: 22, fontWeight: '700' },
  addPill: {
    backgroundColor: card2,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: line,
  },
  addPillText: { color: mint, fontWeight: '700' },

  groupRow: {
    backgroundColor: card,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumb: {
    width: 54,
    height: 54,
    borderRadius: 10,
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: card2,
    borderWidth: 1,
    borderColor: line,
  },
  groupTitle: { color: text, fontSize: 18, fontWeight: '700' },
  groupSub: { color: textDim, marginTop: 2 },
  groupRight: { marginLeft: 12, fontWeight: '800', fontSize: 18 },

  recentCard: {
    backgroundColor: card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: line,
  },
  recentRow: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: card2,
    borderWidth: 1,
    borderColor: line,
  },
});
