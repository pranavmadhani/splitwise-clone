import React from 'react';
import { FlatList, View } from 'react-native';
import Header from '../components/Header';
import { Amount, Body, Card, Dim, H2, Label, PrimaryBtn, Progress, Row, Screen } from '../ui';
import { getDashboardSummary, groups } from '../services/data';
import { palette, radius, spacing } from '../theme';

export default function Home() {
  const summary = getDashboardSummary();

  return (
    <Screen>
      <Header title="Dashboard" />

      {/* Summary card */}
      <Card>
        <Row style={{ justifyContent: 'space-between', marginBottom: spacing[3] }}>
          <View>
            <Label>Total Owed</Label>
            <Amount amt={+summary.in.toFixed(2)} />
          </View>
          <View>
            <Label>Total Owe</Label>
            <Amount amt={-summary.out} />
          </View>
        </Row>
        <Progress value={60} />
        <Row style={{ gap: spacing[3], marginTop: spacing[4] }}>
          <PrimaryBtn title="Settle Up" />
          <PrimaryBtn title="View Details" style={{ backgroundColor: palette.cardElev }} />
        </Row>
      </Card>

      {/* Groups list */}
      <H2 style={{ marginTop: spacing[5], marginBottom: spacing[3] }}>Groups</H2>
      <FlatList
        data={groups}
        keyExtractor={(g) => g.id}
        ItemSeparatorComponent={() => <View style={{ height: spacing[3] }} />}
        renderItem={({ item }) => (
          <Card>
            <Row style={{ justifyContent: 'space-between' }}>
              <Body>{item.name}</Body>
              <Amount amt={item.delta} />
            </Row>
            <Dim style={{ marginTop: 4 }}>{item.status}</Dim>
          </Card>
        )}
      />
    </Screen>
  );
}
