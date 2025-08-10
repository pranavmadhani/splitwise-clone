import React from 'react';
import { View } from 'react-native';
import Header from '../components/Header';
import { Body, Card, H2, Row, Screen } from '../ui';
import { palette, radius, spacing } from '../theme';

const Tile = ({ title, bg }: { title: string; bg: string }) => (
  <Card
    style={{
      backgroundColor: bg,
      borderColor: 'transparent',
      width: '48%',
      height: 130,
      borderRadius: radius.lg,
      justifyContent: 'center',
    }}
  >
    <H2>{title}</H2>
  </Card>
);

export default function NewSplitHub() {
  return (
    <Screen>
      <Header title="New split" />
      <Body style={{ marginBottom: spacing[4], opacity: 0.8 }}>Pick a method</Body>

      <Row style={{ justifyContent: 'space-between', marginBottom: spacing[4] }}>
        <Tile title="Equally" bg="#F4A740" />
        <Tile title="Unequally" bg="#EF6A6A" />
      </Row>
      <Row style={{ justifyContent: 'space-between', marginBottom: spacing[4] }}>
        <Tile title="Percentages" bg="#5FDBA7" />
        <Tile title="Shares" bg="#5FA8FF" />
      </Row>
      <Row style={{ justifyContent: 'space-between' }}>
        <Tile title="Adjustment" bg="#B892FF" />
        <View style={{ width: '48%' }} />
      </Row>

      <Card style={{ marginTop: spacing[5], backgroundColor: palette.card }}>
        <Body>You can combine multiple methods on the same expense.</Body>
      </Card>
    </Screen>
  );
}
