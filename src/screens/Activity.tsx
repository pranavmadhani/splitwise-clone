// src/screens/Activity.tsx
import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';

// ------------------------------------------------------------------
// Dummy data – mirrors the Behance layout (Today/Yesterday sections)
// ------------------------------------------------------------------
type ActivityStatus = 'Owe' | 'Owed' | 'Settled';
type ActivityItem = {
  id: string;
  dateISO: string; // e.g. "2024-05-06"
  time: string;    // e.g. "6:48pm"
  title: string;
  subtitle: string; // "You Added", "Sumit Added", etc.
  status: ActivityStatus;
  amount: number; // positive number; we’ll add +/− via status
  iconBg: string; // pastel circle bg for left icon
  accent: string; // thin line color inside card
  avatars: string[]; // right-bottom stack
};

// two day buckets to match the reference
const TODAY = '2024-05-06';
const YDAY  = '2024-05-05';

const DATA: ActivityItem[] = [
  {
    id: '1',
    dateISO: TODAY,
    time: '6:48pm',
    title: 'PDC printout',
    subtitle: 'You Added',
    status: 'Owe',
    amount: 30.0,
    iconBg: '#BDEAD6',
    accent: '#47B491',
    avatars: [
      'https://i.pravatar.cc/48?img=1',
      'https://i.pravatar.cc/48?img=2',
      'https://i.pravatar.cc/48?img=3',
    ],
  },
  {
    id: '2',
    dateISO: TODAY,
    time: '4:48pm',
    title: "Haldiram’s Snacks",
    subtitle: 'Sumit Added',
    status: 'Owed',
    amount: 26.32,
    iconBg: '#F6C6A7',
    accent: '#E77F2F',
    avatars: [
      'https://i.pravatar.cc/48?img=4',
      'https://i.pravatar.cc/48?img=5',
      'https://i.pravatar.cc/48?img=6',
    ],
  },
  {
    id: '3',
    dateISO: TODAY,
    time: '12:48pm',
    title: 'Train Tickets',
    subtitle: 'Yash Raj Added',
    status: 'Settled',
    amount: 1254.84,
    iconBg: '#C9E9E5',
    accent: '#7ED8C9',
    avatars: [
      'https://i.pravatar.cc/48?img=7',
      'https://i.pravatar.cc/48?img=8',
      'https://i.pravatar.cc/48?img=9',
    ],
  },
  {
    id: '4',
    dateISO: YDAY,
    time: '6:48pm',
    title: 'Hotel Trip',
    subtitle: 'You Added',
    status: 'Owe',
    amount: 854.0,
    iconBg: '#BDEAD6',
    accent: '#47B491',
    avatars: [
      'https://i.pravatar.cc/48?img=4',
      'https://i.pravatar.cc/48?img=2',
      'https://i.pravatar.cc/48?img=5',
    ],
  },
];

// ------------------------------------------------------------------
// Small UI atoms local to this file (no external UI libs)
// ------------------------------------------------------------------
const palette = {
  screenBg: '#0F1316',
  card: '#2C3338',
  cardSoft: '#3A4248',
  text: '#E9ECEF',
  textDim: '#B7C0C8',
  divider: '#2A2F34',
  pillDot: '#1EE0A1',
  oweBg: '#0E6A52',
  owedBg: '#7A3A17',
  settledBg: '#2C6E63',
  oweText: '#D7FFF3',
  owedText: '#FFE9D9',
  settledText: '#DFF6F2',
  moneyPos: '#62D39E',
  moneyNeg: '#FF7C74',
};

function StatusPill({ status }: { status: ActivityStatus }) {
  const cfg = useMemo(() => {
    switch (status) {
      case 'Owe':
        return { bg: palette.oweBg, fg: palette.oweText, label: '• Owe' };
      case 'Owed':
        return { bg: palette.owedBg, fg: palette.owedText, label: '• Owed' };
      case 'Settled':
        return { bg: palette.settledBg, fg: palette.settledText, label: '• Settled' };
    }
  }, [status]);

  return (
    <View style={[styles.pill, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.pillText, { color: cfg.fg }]}>{cfg.label}</Text>
    </View>
  );
}

function Money({ status, amt, big }: { status: ActivityStatus; amt: number; big?: boolean }) {
  const sign = status === 'Owed' ? '-' : status === 'Owe' ? '' : '';
  const color =
    status === 'Owed' ? palette.moneyNeg : status === 'Settled' ? palette.moneyPos : palette.moneyPos;
  return (
    <Text style={[styles.money, big && styles.moneyBig, { color }]}>{`${sign}$${amt.toLocaleString(
      undefined,
      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    )}`}</Text>
  );
}

function AvatarStack({ uris }: { uris: string[] }) {
  return (
    <View style={styles.stack}>
      {uris.slice(0, 3).map((u, i) => (
        <Image
          key={i}
          source={{ uri: u }}
          style={[
            styles.avatar,
            { marginLeft: i === 0 ? 0 : -10, borderColor: palette.screenBg },
          ]}
        />
      ))}
    </View>
  );
}

function RowCard({ item }: { item: ActivityItem }) {
  return (
    <View style={styles.card}>
      {/* Top row */}
      <View style={styles.rowTop}>
        <View style={[styles.iconWrap, { backgroundColor: item.iconBg }]}>
          {/* Little decorative icon – using a dollar glyph to stay dependency-free */}
          <Text style={styles.iconGlyph}>$</Text>
        </View>

        <View style={styles.titleWrap}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </View>

        <View style={styles.rightWrap}>
          <StatusPill status={item.status} />
          <Money status={item.status} amt={item.amount} big />
        </View>
      </View>

      {/* Accent divider */}
      <View style={[styles.accentLine, { backgroundColor: item.accent }]} />

      {/* Bottom row */}
      <View style={styles.rowBottom}>
        <Text style={styles.time}>
          {item.time} {new Date(item.dateISO).toLocaleDateString(undefined, {
            month: 'long',
            day: '2-digit',
            year: 'numeric',
          })}
        </Text>
        <AvatarStack uris={item.avatars} />
      </View>
    </View>
  );
}

// ------------------------------------------------------------------

export default function Activity() {
  // group items by date (Today / Yesterday)
  const sections = useMemo(() => {
    const byDate: Record<string, ActivityItem[]> = {};
    for (const it of DATA) {
      if (!byDate[it.dateISO]) byDate[it.dateISO] = [];
      byDate[it.dateISO].push(it);
    }
    const order = Object.keys(byDate).sort((a, b) => (a > b ? -1 : 1));
    return order.map((d) => ({
      key: d,
      label:
        d === TODAY
          ? 'Today, 04/06/2024'
          : d === YDAY
          ? 'Yesterday, 05/06/2024'
          : new Date(d).toDateString(),
      items: byDate[d],
    }));
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Activity</Text>
        <TouchableOpacity activeOpacity={0.8}>
          <View style={styles.searchDot} />
        </TouchableOpacity>
      </View>

      <FlatList
        contentContainerStyle={styles.listPad}
        data={sections}
        keyExtractor={(s) => s.key}
        renderItem={({ item: section }) => (
          <View style={{ marginBottom: 24 }}>
            <Text style={styles.sectionTitle}>{section.label}</Text>
            {section.items.map((it) => (
              <RowCard key={it.id} item={it} />
            ))}
            {/* thin divider between Today and Yesterday */}
            <View style={styles.sectionDivider} />
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// ------------------------------------------------------------------

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.screenBg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 10,
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: palette.text,
    fontSize: 28,
    fontWeight: '800',
  },
  searchDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#40484F',
  },

  listPad: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },

  sectionTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    opacity: 0.9,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: palette.divider,
    marginTop: 8,
    marginHorizontal: 6,
  },

  card: {
    backgroundColor: palette.card,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconGlyph: {
    fontSize: 24,
    color: '#1E2A2A',
    fontWeight: '900',
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: palette.textDim,
    marginTop: 2,
    fontSize: 13,
    fontWeight: '600',
  },
  rightWrap: {
    alignItems: 'flex-end',
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  pillText: {
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  money: {
    fontSize: 16,
    fontWeight: '800',
  },
  moneyBig: {
    fontSize: 20,
  },

  accentLine: {
    height: 2,
    borderRadius: 2,
    marginTop: 10,
    marginBottom: 10,
    opacity: 0.9,
  },

  rowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  time: {
    color: palette.textDim,
    fontSize: 13,
    fontWeight: '600',
  },

  stack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
  },
});
