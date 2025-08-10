import React, { useState } from 'react';
import { FlatList, View } from 'react-native';
import Header from '../components/Header';
import {
  Amount, Avatar, Body, Card, Dim, H2, Label, Pill, Progress, Row, Screen, Segmented,
} from '../ui';
import { getGroup, listExpensesByGroup } from '../services/data';
import { spacing } from '../theme';

const TABS = ['Expenses', 'Balances', 'Members'] as const;

export default function Group({ route }: any) {
  const id = route?.params?.id || 'g1';
  const group = getGroup(id)!;
  const [tab, setTab] = useState<string>(TABS[0]);

  const ex = listExpensesByGroup(id);

  return (
    <Screen>
      <Header title="Group" />

      {/* Header stat card */}
      <Card>
        <Row style={{ justifyContent: 'space-between', marginBottom: spacing[3] }}>
          <Row style={{ gap: spacing[3] }}>
            <Avatar uri={group.cover} size={44} label={group.name[0]} />
            <View>
              <H2>{group.name}</H2>
              <Dim>Total receivable</Dim>
            </View>
          </Row>
          <Amount amt={group.delta} />
        </Row>
        <Progress value={65} />
        <Row style={{ gap: spacing[3], marginTop: spacing[4] }}>
          <Pill active>Expense view</Pill>
          <Pill>Friends view</Pill>
        </Row>
      </Card>

      {/* Segments like the design */}
      <Segmented style={{ marginTop: spacing[4] }} value={tab} options={[...TABS]} onChange={setTab} />

      {/* Expenses list */}
      {tab === 'Expenses' && (
        <Card style={{ marginTop: spacing[4] }}>
          <Label>Recent expenses</Label>
          <FlatList
            data={ex}
            keyExtractor={(i) => i.id}
            ItemSeparatorComponent={() => <View style={{ height: spacing[3] }} />}
            renderItem={({ item }) => (
              <Row style={{ justifyContent: 'space-between' }}>
                <Row style={{ gap: spacing[3] }}>
                  <Avatar size={36} label={item.paidByName?.slice(0, 1)} />
                  <View>
                    <Body>{item.description}</Body>
                    <Dim>Paid by {item.paidByName}</Dim>
                  </View>
                </Row>
                <Amount amt={item.amount * (item.youLent ? 1 : -1)} />
              </Row>
            )}
          />
        </Card>
      )}

      {tab === 'Balances' && (
        <Card style={{ marginTop: spacing[4] }}>
          <Label>Balances</Label>
          <Dim style={{ marginTop: 8 }}>Mock balances for now.</Dim>
        </Card>
      )}

      {tab === 'Members' && (
        <Card style={{ marginTop: spacing[4] }}>
          <Label>Members</Label>
          <Dim style={{ marginTop: 8 }}>Members list placeholder.</Dim>
        </Card>
      )}
    </Screen>
  );
}
