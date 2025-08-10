import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Title, Subtitle, Card, ListRow, Avatar, Money, Progress, Button } from '../ui';
import * as data from '../services/data';
import { theme } from '../theme';

export default function Friends() {
  const [friends, setFriends] = useState<any[]>([]);
  const [sum, setSum] = useState({ in: 0, out: 0 });

  useEffect(() => {
    setFriends(data.listFriends());
    setSum(data.friendsSummary());
  }, []);

  const pct = sum.in / ((sum.in + sum.out) || 1);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.bg }} contentContainerStyle={{ padding: 16 }}>
      <Title>Friends</Title>
      <View style={{ height: 12 }} />
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Money value={+sum.in} bold />
          <Money value={-sum.out} bold />
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
      <Subtitle>All Friends</Subtitle>
      <Card>
        {friends.map((f) => (
          <ListRow key={f.id} left={<Avatar name={f.name} />} title={f.name} right={<Money value={f.delta} />} />
        ))}
      </Card>
    </ScrollView>
  );
}
