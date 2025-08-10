// src/screens/Home.tsx
import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';

const mint = '#18C29C';
const orange = '#F47A2A';
const red = '#FF5D5D';
const green = '#39C973';
const bg = '#0F141A';
const card = '#1A232C';
const card2 = '#242F3A';
const line = '#0E1217';
const text = '#DEE5ED';
const textDim = '#9AA6B2';

type GroupRow = {
  id: string;
  title: string;
  status: 'you_are_owed' | 'you_owe' | 'settled';
  amount: number; // positive for you're owed, negative for you owe, 0 for settled
  thumb: string;  // image uri
  subline?: string;
};

const GROUPS: GroupRow[] = [
  {
    id: 'g1',
    title: 'Experiential Trip Expenses',
    status: 'settled',
    amount: 0,
    thumb:
      'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=80&w=300&auto=format&fit=crop',
    subline: 'Settled Up',
  },
  {
    id: 'g2',
    title: 'Winter Semester Trio',
    status: 'you_are_owed',
    amount: 95,
    thumb:
      'https://images.unsplash.com/photo-1545239500-39d3c4371d1c?q=80&w=300&auto=format&fit=crop',
    subline: 'you are Owed $95.00',
  },
  {
    id: 'g3',
    title: 'Goa Trip',
    status: 'you_owe',
    amount: -54,
    thumb:
      'https://images.unsplash.com/photo-1558980664-10eaaff26d20?q=80&w=300&auto=format&fit=crop',
    subline: 'you Owe $54.00',
  },
];

export default function Home() {
  // fake totals for the card
  const totalOwed = 320.86;
  const totalOwe = 178.34;
  const ratio = totalOwed / (totalOwed + totalOwe); // 0..1

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top bar */}
      <View style={styles.topbar}>
        <View style={{ width: 28 }} />
        <Text style={styles.title}>Dashboard</Text>
        <View style={styles.actions}>
          <View style={styles.bubble}>
            <Feather name="search" size={18} color={text} />
          </View>
          <View style={[styles.bubble, { marginLeft: 12 }]}>
            <Ionicons name="notifications-outline" size={19} color={text} />
          </View>
        </View>
      </View>

      <FlatList
        ListHeaderComponent={
          <>
            {/* Totals card */}
            <View style={styles.totalsCard}>
              <View style={styles.totalsRow}>
                <View>
                  <Text style={styles.totalsLabel}>Total Owed</Text>
                  <Text style={[styles.totalsValue, { color: mint }]}>
                    +${totalOwed.toFixed(2)}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.totalsLabel}>Total Owe</Text>
                  <Text style={[styles.totalsValue, { color: orange }]}>
                    -${totalOwe.toFixed(2)}
                  </Text>
                </View>
              </View>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.min(100, Math.max(0, ratio * 100))}%` }]} />
              </View>

              <View style={styles.ctaRow}>
                <TouchableOpacity style={styles.primaryBtn}>
                  <Text style={styles.primaryBtnText}>Settle Up</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.outlineBtn]}>
                  <Text style={[styles.outlineText]}>View Details</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.outlineBtn]}>
                  <Text style={styles.outlineText}>Balance</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Groups header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Groups</Text>
              <TouchableOpacity style={styles.addPill}>
                <Text style={styles.addPillText}>Add+</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        data={GROUPS}
        keyExtractor={(g) => g.id}
        contentContainerStyle={{ paddingBottom: 28 }}
        renderItem={({ item }) => <GroupItem item={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        style={{ paddingHorizontal: 18 }}
      />
    </SafeAreaView>
  );
}

function GroupItem({ item }: { item: GroupRow }) {
  const rightColor =
    item.amount > 0 ? green : item.amount < 0 ? red : textDim;

  const rightText =
    item.amount > 0
      ? `+$${Math.abs(item.amount).toFixed(2)}`
      : item.amount < 0
      ? `-$${Math.abs(item.amount).toFixed(2)}`
      : '+$0.00';

  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.groupRow}>
      <Image source={{ uri: item.thumb }} style={styles.thumb} />

      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={styles.groupTitle}>
          {item.title}
        </Text>
        {!!item.subline && (
          <Text numberOfLines={1} style={styles.groupSub}>
            {item.subline}
          </Text>
        )}
      </View>

      <Text style={[styles.groupRight, { color: rightColor }]}>{rightText}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: bg },
  topbar: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { color: text, fontSize: 26, fontWeight: '700' },
  actions: { flexDirection: 'row', alignItems: 'center' },
  bubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: card,
    alignItems: 'center',
    justifyContent: 'center',
  },

  totalsCard: {
    backgroundColor: card,
    borderRadius: 22,
    padding: 16,
    marginHorizontal: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  totalsLabel: { color: textDim, fontSize: 14, marginBottom: 4 },
  totalsValue: { fontSize: 22, fontWeight: '700' },

  progressTrack: {
    height: 12,
    backgroundColor: card2,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: mint,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },

  ctaRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  primaryBtn: {
    backgroundColor: mint,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  primaryBtnText: { color: '#0C1217', fontWeight: '700', fontSize: 16 },

  outlineBtn: {
    borderWidth: 1.5,
    borderColor: orange,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  outlineText: { color: orange, fontWeight: '700' },

  sectionHeader: {
    paddingHorizontal: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { color: text, fontSize: 22, fontWeight: '700' },
  addPill: {
    backgroundColor: card2,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: line,
  },
  addPillText: { color: mint, fontWeight: '700' },

  groupRow: {
    backgroundColor: card,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumb: { width: 54, height: 54, borderRadius: 10, marginRight: 14 },
  groupTitle: { color: text, fontSize: 18, fontWeight: '700' },
  groupSub: { color: textDim, marginTop: 2 },
  groupRight: { marginLeft: 12, fontWeight: '800', fontSize: 18 },
});
