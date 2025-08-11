import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Title, Card, Input, Button } from '../ui';
import { theme } from '../theme';
import Icon from '../components/Icon';
import { offlineExpenses, offlineGroups, offlineAuth } from '../services/offline';

type SplitType = 'equal' | 'exact' | 'percentage' | 'shares';

export default function AddExpense({ navigation, route }: any) {
  // If you navigate with: navigation.navigate('AddExpense', { groupId })
  const presetGroupId: string | undefined = route?.params?.groupId;

  const [groups, setGroups] = useState<any[]>([]);
  const [groupId, setGroupId] = useState<string>(presetGroupId || '');
  const [members, setMembers] = useState<any[]>([]);
  const [usersById, setUsersById] = useState<Record<string, any>>({});
  const [me, setMe] = useState<any>(null);

  // form
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('0');
  const [paidById, setPaidById] = useState('');
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [parts, setParts] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      const _me = await offlineAuth.me();
      setMe(_me);
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
      setMembers(ms);
      const map: any = {};
      ms.forEach((m: any) => (map[m.id] = m));
      setUsersById(map);
      setPaidById(ms.find((m: any) => m.id === me?.id)?.id || ms[0]?.id || '');
      const init: any = {};
      ms.forEach((m: any) => (init[m.id] = 0));
      setParts(init);
    })();
  }, [groupId, me?.id]);

  const splitHint = useMemo(() => {
    if (splitType === 'exact') return 'Exact amounts must sum to total.';
    if (splitType === 'percentage') return 'Percentages must sum to 100.';
    if (splitType === 'shares') return 'Shares are proportional weights.';
    return '';
  }, [splitType]);

  function upd(uid: string, v: number) {
    setParts((p) => ({ ...p, [uid]: isNaN(v) ? 0 : v }));
  }

  async function save() {
    if (!groupId) return Alert.alert('Pick a group');
    if (!desc.trim()) return Alert.alert('Description required');
    const amt = parseFloat(String(amount));
    if (!isFinite(amt) || amt <= 0) return Alert.alert('Enter a valid amount > 0');
    if (!paidById) return Alert.alert('Pick who paid');

    // validations for non-equal splits
    if (splitType === 'exact') {
      const sum = Object.values(parts).reduce((a, b: any) => a + Number(b || 0), 0);
      if (Math.abs(sum - amt) > 0.01) return Alert.alert('Exact parts must sum to total amount');
    }
    if (splitType === 'percentage') {
      const sum = Object.values(parts).reduce((a, b: any) => a + Number(b || 0), 0);
      if (Math.abs(sum - 100) > 0.01) return Alert.alert('Percentages must sum to 100');
    }
    if (splitType === 'shares') {
      const sum = Object.values(parts).reduce((a, b: any) => a + Number(b || 0), 0);
      if (sum <= 0) return Alert.alert('Shares must be > 0');
    }

    await offlineExpenses.add({
      groupId,
      description: desc.trim(),
      amount: amt,
      paidById,
      split: {
        splitType,
        parts: Object.entries(parts).map(([userId, value]) => ({ userId, value: Number(value || 0) })),
      },
    });

    Alert.alert('Saved', 'Expense added.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
  }

  return (
    <View style={styles.wrap}>
      {/* Header (kept minimal so it drops into your existing stack) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Icon type="ion" name="chevron-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Title>Add expense</Title>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
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
          <Text style={styles.h}>Details</Text>
          <Input label="Description" value={desc} onChangeText={setDesc} />
          <Input label="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
          <Text style={styles.label}>Paid by</Text>
          <RowWrap>
            {members.map((m) => {
              const active = paidById === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  onPress={() => setPaidById(m.id)}
                  style={[
                    styles.pill,
                    { backgroundColor: active ? theme.colors.brand : '#fff', borderColor: theme.colors.line },
                  ]}
                >
                  <Text style={{ color: active ? '#fff' : theme.colors.text, fontWeight: '700' }}>
                    {m.name || m.email}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </RowWrap>
        </Card>

        <Card>
          <Text style={styles.h}>Split</Text>
          <View style={styles.row}>
            {(['equal', 'exact', 'percentage', 'shares'] as SplitType[]).map((t) => {
              const active = splitType === t;
              return (
                <TouchableOpacity
                  key={t}
                  onPress={() => setSplitType(t)}
                  style={[styles.splitBtn, active && styles.splitBtnActive]}
                >
                  <Text style={[styles.splitText, active && styles.splitTextActive]}>{t}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {splitType !== 'equal' && (
            <View style={{ marginTop: 8 }}>
              {members.map((m) => (
                <View key={m.id} style={styles.assignRow}>
                  <Text style={styles.muted}>{m.name || m.email}</Text>
                  <Input
                    style={{ width: 120, textAlign: 'right' }}
                    value={String(parts[m.id] || 0)}
                    onChangeText={(v) => upd(m.id, parseFloat(v))}
                    keyboardType="decimal-pad"
                  />
                </View>
              ))}
              <Text style={styles.hint}>
                {splitType === 'exact' && 'Exact amounts must sum to total.'}
                {splitType === 'percentage' && ' Percentages must sum to 100.'}
                {splitType === 'shares' && ' Shares are proportional weights.'}
              </Text>
            </View>
          )}
        </Card>

        <View style={{ height: 6 }} />
        <Button title="Save expense" onPress={save} />
        <View style={{ height: 24 }} />
      </ScrollView>
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
  label: { color: theme.colors.subtext, marginBottom: 6 },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  splitBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  splitBtnActive: { backgroundColor: theme.colors.brand, borderColor: theme.colors.brand },
  splitText: { color: theme.colors.text, fontWeight: '700' },
  splitTextActive: { color: '#fff' },
  assignRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.line,
  },
  muted: { color: theme.colors.subtext },
  hint: { color: theme.colors.subtext, fontSize: 12, marginTop: 6 },
});
