import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Title, Subtitle, Input, Button, Card } from '../ui';
import { theme } from '../theme';

export default function AddExpense() {
  const [method, setMethod] = useState<'equally' | 'unequally' | 'percentage'>('equally');
  const [amount] = useState('200.00');

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.bg }} contentContainerStyle={{ padding: 16 }}>
      <Title>Add Expense</Title>
      <View style={{ height: 12 }} />
      <Card>
        <Subtitle>For</Subtitle>
        <Input placeholder="Enter a description" />
        <Subtitle style={{ marginTop: 8 }}>Amount</Subtitle>
        <Title style={{ fontSize: 36, color: '#A0F0E5' }}> ${amount}</Title>
        <View style={{ height: 8 }} />
        <View style={{ flexDirection: 'row', backgroundColor: '#0E141A', borderRadius: 999, overflow: 'hidden' }}>
          {(['equally', 'unequally', 'percentage'] as const).map((k) => (
            <Button key={k} title={k[0].toUpperCase() + k.slice(1)} kind={method === k ? 'primary' : 'ghost'} onPress={() => setMethod(k)} />
          ))}
        </View>
        <View style={{ height: 8 }} />
        <Subtitle>Paid by</Subtitle>
        <Input value="you" />
      </Card>

      <View style={{ height: 12 }} />
      <Button title="Done" />
    </ScrollView>
  );
}
