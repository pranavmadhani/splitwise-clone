import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, FlatList } from 'react-native';
import { Title, Subtitle, Card, Input, Button } from '../ui';
import { theme } from '../theme';
import Icon from '../components/Icon';
import { offlineAuth, offlineExpenses, offlineGroups } from '../services/offline';

const GREEN = '#27ae60';
const RED = '#e54f4f';

export default function SettleUp({ navigation, route }: any) {
  // optional: preselect a group
  const presetGroupId: string | undefined = route?.params?.groupId;

  const [groups, setGroups] = useState<any[]>([]);
  const [groupId, setGroupId] = useState<string>(presetGroupId || '');
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [usersById, setUsersById] = useState<Record<string, any>>({});
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const _me = await offlineAuth.me(); setMe(_me);
      const gs = await offlineGroups.list();
      setGroups(gs);
      setGroupId(presetGroupId || gs[0]?.id || '');
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!groupId) return;
      const full = await offlineGroups.members(groupId);
      const ms = full?.members?.map((m: any) => m.user) || [];
      const map: any = {}; ms.forEach((m: any)=> map[m.id]=m);
      setUsersById(map);

      const bal = await offlineExpenses.balances(groupId);
      setBalances(bal);

      const s = await offlineExpenses.suggest(groupId);
      setSuggestions(s);
    })();
  }, [groupId]);

  const totalPositive = useMemo(
    () => Object.values(balances).filter(v => v>0).reduce((a,b)=>a+b,0),
    [balances]
  );

  async function markPaid(t: any) {
    if (!me?.id) return Alert.alert('Need a signed-in user');
    await offlineExpenses.markPaid(groupId, t.toId, t.amount, me.id);
    // reload
    const bal = await offlineExpenses.balances(groupId);
    setBalances(bal);
    const s = await offlineExpenses.suggest(groupId);
    setSuggestions(s);
    Alert.alert('Done', 'Payment recorded locally.');
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Icon type="ion" name="chevron-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Title>Settle up</Title>
        <View style={{ width: 36 }} />
      </View>

      <View style={{ padding: 16, gap: 12 }}>
        <Card>
          <Text style={styles.h}>Group</Text>
          <RowWrap>
            {groups.map((g) => {
              const active = groupId === g.id;
              return (
                <TouchableOpacity
                  key={g.id}
                  onPress={() => setGroupId(g.id)}
                  style={[
                    styles.chip,
                    { backgroundColor: active ? theme.colors.brand : '#fff', borderColor: theme.colors.line },
                  ]}
                >
                  <Text style={{ color: active ? '#fff' : theme.colors.text, fontWeight: '700' }}>{g.name}</Text>
                </TouchableOpacity>
              );
            })}
          </RowWrap>
        </Card>

        <Card>
          <Text style={styles.h}>Balances</Text>
          {Object.entries(balances).length === 0 && <Text style={styles.muted}>No balances yet.</Text>}
          {Object.entries(balances).map(([uid, v]) => (
            <View key={uid} style={styles.row}>
              <Text style={styles.name}>{usersById[uid]?.name || usersById[uid]?.email || uid.slice(0, 6)}</Text>
              <Text style={{ color: v >= 0 ? GREEN : RED }}>
                {v >= 0 ? '+' : '-'}${Math.abs(Number(v)).toFixed(2)}
              </Text>
            </View>
          ))}
        </Card>

        <Card>
          <Text style={styles.h}>Suggested payments</Text>
          {suggestions.length === 0 && <Text style={styles.muted}>All settled ✅</Text>}
          <FlatList
            data={suggestions}
            keyExtractor={(_, i) => String(i)}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={({ item: t }) => (
              <View style={styles.row}>
                <Text style={styles.name}>
                  <Text style={{ color: RED }}>
                    {usersById[t.fromId]?.name || usersById[t.fromId]?.email || t.fromId.slice(0, 6)}
                  </Text>{' '}
                  pays
                  <Text style={{ fontWeight: '700' }}> ${Number(t.amount).toFixed(2)}</Text> to
                  <Text style={{ color: GREEN }}>
                    {' '}
                    {usersById[t.toId]?.name || usersById[t.toId]?.email || t.toId.slice(0, 6)}
                  </Text>
                </Text>
                <Button title="Mark paid" onPress={() => markPaid(t)} kind="ghost" />
              </View>
            )}
          />
          <View style={{ height: 8 }} />
          {totalPositive > 0 && (
            <Text style={styles.muted}>Total to settle: ${totalPositive.toFixed(2)}</Text>
          )}
        </Card>
      </View>
    </View>
  );
}

function RowWrap({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{children}</View>;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#fff' },
  header: {
    height: 56,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  h: { fontWeight: '700', marginBottom: 8, color: theme.colors.text },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.line,
  },
  name: { color: theme.colors.text },
  muted: { color: theme.colors.subtext },
});
