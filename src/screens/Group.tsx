import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Title, Subtitle, Card, Input, Button } from '../ui';
import { theme } from '../theme';
import { offlineExpenses, offlineGroups, offlineAuth } from '../services/offline';

type SplitType = 'equal' | 'exact' | 'percentage' | 'shares';

// local colors (avoid relying on theme.green/red that may not exist)
const GREEN = '#27ae60';
const RED = '#e54f4f';
const LINE = theme.colors.line;
const TXT = theme.colors.text;
const SUB = theme.colors.subtext;

// lightweight pill (self-contained; no prop mismatch)
function TinyPill({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.pill,
        { borderColor: LINE, backgroundColor: active ? theme.colors.brand : '#fff' },
      ]}
    >
      <Text style={[styles.pillText, { color: active ? '#fff' : TXT }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function Group({ route }: any) {
  const id = route.params.id as string;
  const [group, setGroup] = useState<any>();
  const [members, setMembers] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [usersById, setUsersById] = useState<Record<string, any>>({});
  const [me, setMe] = useState<any>(null);

  // form
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('0');
  const [paidById, setPaidById] = useState('');
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [parts, setParts] = useState<Record<string, number>>({});
  const [memberId, setMemberId] = useState('');

  async function load() {
    const g = await offlineGroups.members(id);
    if (!g) {
      Alert.alert('Group missing');
      return;
    }
    setGroup(g);

    const ms = g.members?.map((m: any) => m.user) || [];
    setMembers(ms);
    const uby: any = {};
    for (const m of ms) uby[m.id] = m;
    setUsersById(uby);

    const ex = await offlineExpenses.listByGroup(id);
    setExpenses(ex);

    const bal = await offlineExpenses.balances(id);
    setBalances(bal);

    const init: any = {};
    for (const m of ms) init[m.id] = 0;
    setParts(init);

    const current = await offlineAuth.me();
    setMe(current);
  }
  useEffect(() => {
    load();
  }, [id]);

  const total = useMemo(() => expenses.reduce((s, e) => s + Number(e.amount), 0), [expenses]);

  function upd(uid: string, v: number) {
    setParts((p) => ({ ...p, [uid]: isNaN(v) ? 0 : v }));
  }

  async function addExpense() {
    if (!desc.trim()) return Alert.alert('Description required');
    if (!paidById.trim()) return Alert.alert('Enter a valid payer userId');
    try {
      await offlineExpenses.add({
        groupId: id,
        description: desc,
        amount: Number(amount),
        paidById,
        split: { splitType, parts: Object.entries(parts).map(([userId, value]) => ({ userId, value })) },
      });
      setDesc('');
      setAmount('0');
      setPaidById('');
      await load();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to add expense');
    }
  }

  async function addMember() {
    if (!memberId.trim()) return;
    await offlineGroups.addMember(id, memberId.trim());
    setMemberId('');
    await load();
  }

  async function pay(t: any) {
    if (!me?.id) return Alert.alert('Need a signed-in user to mark paid');
    await offlineExpenses.markPaid(id, t.toId, t.amount, me.id);
    await load();
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <View>
        <Title>{group?.name || 'Group'}</Title>
        <Subtitle>Total spent: ${total.toFixed(2)}</Subtitle>
      </View>

      <Card>
        <Text style={styles.h}>Add expense</Text>
        <Input label="Description" value={desc} onChangeText={setDesc} />
        <Input label="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
        <Input label="Paid by (userId)" value={paidById} onChangeText={setPaidById} />
        <View style={styles.pills}>
          {(['equal', 'exact', 'percentage', 'shares'] as SplitType[]).map((t) => (
            <TinyPill key={t} label={t} active={splitType === t} onPress={() => setSplitType(t)} />
          ))}
        </View>
        {['exact', 'percentage', 'shares'].includes(splitType) && (
          <View style={{ marginVertical: 8 }}>
            {members.map((m) => (
              <View key={m.id} style={styles.row}>
                <Text style={styles.name}>{m.name || m.email}</Text>
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
        <Button title="Save expense" onPress={addExpense} />
      </Card>

      <Card>
        <Text style={styles.h}>Expenses</Text>
        {expenses.map((e) => (
          <View key={e.id} style={styles.row}>
            <View>
              <Text style={styles.name}>{e.description}</Text>
              <Text style={styles.muted}>
                Paid by {usersById[e.paidById]?.name || usersById[e.paidById]?.email || e.paidById}
              </Text>
            </View>
            <Text style={styles.amount}>${Number(e.amount).toFixed(2)}</Text>
          </View>
        ))}
        {expenses.length === 0 && <Text style={styles.muted}>No expenses yet.</Text>}
      </Card>

      <Card>
        <Text style={styles.h}>Members</Text>
        {members.map((m) => (
          <View key={m.id} style={styles.row}>
            <Text style={styles.name}>{m.name || m.email}</Text>
            <Text style={styles.muted}>{m.id.slice(0, 8)}…</Text>
          </View>
        ))}
        <Input label="Add member by userId" value={memberId} onChangeText={setMemberId} />
        <Button title="Add member" onPress={addMember} kind="ghost" />
      </Card>

      <Card>
        <Text style={styles.h}>Balances</Text>
        {Object.entries(balances).map(([uid, v]) => (
          <View key={uid} style={styles.row}>
            <Text style={styles.name}>{usersById[uid]?.name || usersById[uid]?.email || uid.slice(0, 6)}</Text>
            <Text style={{ color: Number(v) >= 0 ? GREEN : RED }}>
              {Number(v) >= 0 ? '+' : '-'}${Math.abs(Number(v)).toFixed(2)}
            </Text>
          </View>
        ))}
        {Object.keys(balances).length === 0 && <Text style={styles.muted}>No balances yet.</Text>}
      </Card>

      <Card>
        <Text style={styles.h}>Settlement suggestions</Text>
        <Settlements id={id} usersById={usersById} onPay={pay} />
      </Card>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

function Settlements({
  id,
  usersById,
  onPay,
}: {
  id: string;
  usersById: Record<string, any>;
  onPay: (t: any) => void;
}) {
  const [list, setList] = useState<any[]>([]);
  useEffect(() => {
    offlineExpenses.suggest(id).then(setList);
  }, [id]);

  if (list.length === 0) return <Text style={styles.muted}>No settlements needed.</Text>;

  return (
    <View style={{ gap: 10 }}>
      {list.map((t, i) => (
        <View key={i} style={styles.row}>
          <Text style={styles.name}>
            <Text style={{ color: RED }}>
              {usersById[t.fromId]?.name || usersById[t.fromId]?.email || t.fromId.slice(0, 6)}
            </Text>{' '}
            pays
            <Text style={{ color: TXT, fontWeight: '700' }}> ${Number(t.amount).toFixed(2)}</Text> to
            <Text style={{ color: GREEN }}>
              {' '}
              {usersById[t.toId]?.name || usersById[t.toId]?.email || t.toId.slice(0, 6)}
            </Text>
          </Text>
          <Button title="Mark paid" onPress={() => onPay(t)} kind="ghost" />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  h: { fontWeight: '700', marginBottom: 8, color: TXT },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopColor: LINE,
    borderTopWidth: 1,
  },
  name: { color: TXT },
  muted: { color: SUB },
  amount: { color: TXT, fontWeight: '700' },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 6 },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  pillText: { fontWeight: '700' },
  hint: { color: SUB, fontSize: 12 },
});
