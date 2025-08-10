import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Title, Subtitle, Card } from '../ui';

const tiles = [
  { key: 'equally',    label: 'Equally',     bg: '#FCD34D', mark: '≡' },
  { key: 'unequally',  label: 'Unequally',   bg: '#FB7185', mark: '⊘' },
  { key: 'percent',    label: 'Percentages', bg: '#34D399', mark: '%' },
  { key: 'shares',     label: 'Shares',      bg: '#60A5FA', mark: '▇' },
  { key: 'adjust',     label: 'Adjustment',  bg: '#A78BFA', mark: '±' },
];

export default function NewSplitHub() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0B1220', padding: 16 }}>
      <Title style={{ color: '#E4E6E9' as any }}>New split</Title>
      <Subtitle style={{ color: '#95A0AE' as any }}>Pick a method</Subtitle>

      <View style={{ height: 12 }} />
      <View style={styles.grid}>
        {tiles.map((t) => (
          <TouchableOpacity key={t.key} onPress={() => {}}>
            <View style={[styles.tile, { backgroundColor: t.bg }]}>
              <Text style={styles.tileKicker}>SPLIT</Text>
              <Text style={styles.tileTitle}>{t.label}</Text>
              <Text style={styles.watermark}>{t.mark}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 12 }} />
      <Card>
        <Subtitle>Tip</Subtitle>
        <Subtitle style={{ marginTop: 6 }}>
          You can combine multiple methods on the same expense — like exact amounts for two people, equal for the rest.
        </Subtitle>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, rowGap: 16 },
  tile: {
    width: 160, height: 110, borderRadius: 18, padding: 14, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, elevation: 4,
  },
  tileKicker: { color: '#0B1220', fontWeight: '800', opacity: 0.6, fontSize: 12, letterSpacing: 1 },
  tileTitle: { color: '#0B1220', fontWeight: '900', fontSize: 22, marginTop: 2 },
  watermark: { position: 'absolute', right: 8, bottom: -10, fontSize: 64, color: '#000', opacity: 0.12, fontWeight: '900' },
});
