import React, { useEffect, useState } from 'react';
import { ScrollView, View, Image } from 'react-native';
import { Title, Subtitle, Card, ListRow, Progress, Money, Button } from '../ui';
import { theme } from '../theme';
import * as data from '../services/data';

export default function Home() {
  const [summary, setSummary] = useState({ in: 0, out: 0 });
  const [groups, setGroups] = useState<any[]>([]);

  useEffect(() => {
    setSummary(data.getDashboardSummary());
    setGroups(data.listGroups());
  }, []);

  const pct = summary.in / ((summary.in + summary.out) || 1);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.bg }} contentContainerStyle={{ padding: 16 }}>
      <Title>Dashboard</Title>
      <View style={{ height: 12 }} />
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Subtitle>Total Owed</Subtitle>
            <Money value={+summary.in} bold />
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Subtitle>Total Owe</Subtitle>
            <Money value={-summary.out} bold />
          </View>
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
      <Subtitle>Groups</Subtitle>
      <Card>
        {groups.map((g) => (
          <ListRow
            key={g.id}
            left={<Image source={{ uri: g.cover }} style={{ width: 42, height: 42, borderRadius: 10 }} />}
            title={g.name}
            caption={g.status}
            right={<Money value={g.delta} />}
          />
        ))}
      </Card>
    </ScrollView>
  );
}
