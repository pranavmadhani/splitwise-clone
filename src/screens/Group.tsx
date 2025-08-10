import React, { useEffect, useMemo, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Title, Subtitle, Card, ListRow, Avatar, Progress, Tag, Button, SectionHeader, Money } from '../ui';
import { theme } from '../theme';
import * as data from '../services/data';

export default function Group({ route }: any) {
  const id = route?.params?.id ?? 'g1';

  const [group, setGroup] = useState<any>();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [summary, setSummary] = useState<{ totalIn: number; totalOut: number }>({ totalIn: 0, totalOut: 0 });

  useEffect(() => {
    setGroup(data.getGroup(id));
    setExpenses(data.listExpensesByGroup(id));
    setSummary(data.getGroupSummary(id));
  }, [id]);

  const months = useMemo(() => {
    const fmt = (ts: number) =>
      new Date(ts).toLocaleString('en', { month: 'long', year: 'numeric' });
    const m: Record<string, any[]> = {};
    expenses.forEach((e) => {
      const k = fmt(e.createdAt);
      (m[k] ||= []).push(e);
    });
    return Object.entries(m);
  }, [expenses]);

  const totalBar = (summary.totalIn + summary.totalOut) || 1;
  const pct = summary.totalIn / totalBar;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 96 }}>
      <Title>{group?.name || 'Group'}</Title>
      <View style={{ height: 12 }} />

      <Card>
        <Subtitle>Total Owed</Subtitle>
        <View style={{ height: 4 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Money value={+summary.totalIn} bold />
          <Money value={-summary.totalOut} bold />
        </View>
        <View style={{ height: 10 }} />
        <Progress value={pct} />
        <View style={{ height: 12 }} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button title="Settle Up" />
          <Button title="View Details" kind="ghost" />
          <Button title="Balance" kind="ghost" />
        </View>
      </Card>

      <View style={{ height: 12 }} />
      <Card>
        <Subtitle>Group expenses</Subtitle>
        {months.map(([label, arr]) => (
          <View key={label}>
            <SectionHeader label={label} />
            {arr.map((e) => (
              <ListRow
                key={e.id}
                left={<Avatar name={e.paidByName || 'You'} />}
                title={e.description}
                caption={`${new Date(e.createdAt).toLocaleDateString()} • Paid by ${e.paidByName || 'You'}`}
                right={
                  <View style={{ alignItems: 'flex-end' }}>
                    <Tag
                      tone={e.youLent ? 'lent' : e.youBorrowed ? 'borrowed' : 'settled'}
                      label={e.youLent ? 'Lent' : e.youBorrowed ? 'Borrowed' : 'Settled'}
                    />
                    <View style={{ height: 6 }} />
                    <Money value={e.amount * (e.youLent ? 1 : -1)} />
                  </View>
                }
              />
            ))}
          </View>
        ))}
        {expenses.length === 0 && <Subtitle>No expenses yet.</Subtitle>}
      </Card>
    </ScrollView>
  );
}
