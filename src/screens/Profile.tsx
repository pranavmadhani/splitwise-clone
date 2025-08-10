import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Switch, TouchableOpacity, Image } from 'react-native';
import { colors } from '../theme';
import { Title, Subtitle, ListRow, Button, Icon } from '../ui';

export default function Profile() {
  const [notifOn, setNotifOn] = useState(true);
  const [passcodeOn, setPasscodeOn] = useState(false);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Top bar */}
      <View style={styles.header}>
        <Icon name="sliders" size={22} />
        <Title style={styles.headerTitle}>Account</Title>
        <Icon name="search" size={22} />
      </View>

      {/* Profile card */}
      <View style={styles.profileCard}>
        <Image
          source={{
            uri:
              'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
          }}
          style={styles.avatar}
        />
        <View style={{ flex: 1 }}>
          <Title>Lakshay Mahur</Title>
          <Subtitle>lakshaymahur***@gmail.com</Subtitle>
        </View>
        <TouchableOpacity style={styles.editBadge}>
          <Icon name="edit-2" size={16} />
        </TouchableOpacity>
      </View>

      <View style={styles.hr} />

      {/* Additions */}
      <SectionTitle label="Additions" />
      <Card>
        <ListRow
          left={<Icon name="camera" />}
          title="Scan Code"
          caption="Use QR code to add friend"
          right={<Icon name="chevron-down" />}
        />
        <Separator />
        <ListRow
          left={<Icon name="gift" />}
          title="Get Premium"
          caption="Unlock the premium with 25% discount"
          right={<Icon name="chevron-down" />}
        />
      </Card>

      {/* Preferences */}
      <SectionTitle label="Preferences" />
      <Card>
        <ListRow
          left={<Icon name="bell" />}
          title="Notification"
          caption="Customize your alert preferences"
          right={
            <Switch
              value={notifOn}
              onValueChange={setNotifOn}
              trackColor={{ false: '#2E3236', true: colors.primary }}
              thumbColor="#fff"
            />
          }
        />
        <Separator />
        <ListRow
          left={<Icon name="lock" />}
          title="Create/Change Passcode"
          caption="Create Passcode for 2-FA"
          right={
            <Switch
              value={passcodeOn}
              onValueChange={setPasscodeOn}
              trackColor={{ false: '#2E3236', true: colors.primary }}
              thumbColor="#fff"
            />
          }
        />
      </Card>

      {/* Feedback & Help */}
      <SectionTitle label="Feedback & Help" />
      <Card>
        <ListRow
          left={<Icon name="star" />}
          title="Rate Splitwise"
          caption="Share your Feedback with US"
          right={<Icon name="chevron-down" />}
        />
        <Separator />
        <ListRow
          left={<Icon name="help-circle" />}
          title="Help & Support"
          caption="Find answers and assistance here"
          right={<Icon name="chevron-down" />}
        />
      </Card>

      {/* Logout */}
      <View style={{ height: 24 }} />
      <Button kind="secondary" title="Logout" onPress={() => {}} style={styles.logout} />
      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

/* ---------- helpers ---------- */

function SectionTitle({ label }: { label: string }) {
  return <Title style={styles.sectionTitle}>{label}</Title>;
}

function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function Separator() {
  return <View style={styles.sep} />;
}

/* ---------- styles ---------- */

const CARD_RADIUS = 20;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
  },
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: CARD_RADIUS,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    // subtle shadow cross-platform
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  editBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card, // no cardElev token in your theme
    marginLeft: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  hr: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
    opacity: 0.6,
  },
  sectionTitle: {
    marginBottom: 8,
    fontSize: 16,
    opacity: 0.9,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    marginBottom: 16,
    // shadow like above
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  sep: {
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.6,
    marginLeft: 16 + 28, // aligns under text, not icons
  },
  logout: {
    borderRadius: CARD_RADIUS,
  },
});
