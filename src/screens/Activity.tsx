import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Title, Subtitle, Card, ListRow, SectionHeader, Money, Avatar, Tag } from '../ui';
import * as data from '../services/data';

export default function Activity() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    setItems(data.listActivity());
  }, []);

  const byDate = useMemo(() => {
    const fmt = (ts: number) =>
      new Date(ts).toLocaleDateString('en', { month: 'long', day: '2-digit', year: 'numeric' });
    const m: Record<string, any[]> = {};
    items.forEach((a) => {
      const k = fmt(a.ts);
      (m[k] ||= []).push(a);
    });
    return Object.entries(m);
  }, [items]);

  const tone = (a: any) =>
    a.status === 'Settled' ? 'settled' : a.direction === 'in' ? 'owe' : a.direction === 'out' ? 'borrowed' : 'lent';

  const amt = (a: any) => (a.direction === 'in' ? +a.amount : -a.amount);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0B0F13' }} contentContainerStyle={{ padding: 16 }}>
      <Title>Activity</Title>
      <Subtitle>Today, this week and earlier</Subtitle>
      <View style={{ height: 12 }} />
      <Card>
        {byDate.map(([label, arr]) => (
          <View key={label}>
            <SectionHeader label={label} />
            {arr.map((a: any) => (
              <ListRow
                key={a.id}
                left={<Avatar name={a.who || 'User'} />}
                title={a.text}
                caption={a.note}
                right={
                  <View style={{ alignItems: 'flex-end' }}>
                    <Tag tone={tone(a) as any} label={a.status} />
                    <View style={{ height: 6 }} />
                    <Money value={amt(a)} bold />
                  </View>
                }
              />
            ))}
          </View>
        ))}
        {items.length === 0 && <Subtitle>No activity yet.</Subtitle>}
      </Card>
    </ScrollView>
  );
}
