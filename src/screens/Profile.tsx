import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, Share } from 'react-native';
import { Title, Subtitle, Card, Input, Button } from '../ui';
import { theme } from '../theme';
import { offlineAuth } from '../services/offline';
import { all, run } from '../local/db';

export default function Profile() {
  const [me, setMe] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  async function load() {
    const u = await offlineAuth.me();
    setMe(u);
    setName(u?.name ?? '');
    setEmail(u?.email ?? '');
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!me?.id) return;
    await run('UPDATE users SET name=?, email=? WHERE id=?', [name.trim(), email.trim(), me.id]);
    await load();
    Alert.alert('Saved', 'Profile updated locally.');
  }

  async function exportData() {
    // dumb JSON export for your own backup/testing
    const dump: any = {};
    for (const tbl of ['users','me','groups','group_members','expenses','expense_shares','payments']) {
      dump[tbl] = await all(`SELECT * FROM ${tbl}`);
    }
    const json = JSON.stringify(dump, null, 2);
    try {
      await Share.share({ message: json });
    } catch (e) {
      Alert.alert('Share failed', String(e));
    }
  }

  async function nukeAll() {
    Alert.alert('Reset all data?', 'This clears ALL local data.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: async () => {
        for (const tbl of ['expense_shares','expenses','payments','group_members','groups','me','users']) {
          await run(`DELETE FROM ${tbl}`);
        }
        await load();
        Alert.alert('Wiped', 'All local data removed.');
      }},
    ]);
  }

  return (
    <View style={styles.wrap}>
      <Title>Account</Title>
      <Subtitle>Device-local profile. No cloud auth required.</Subtitle>

      <View style={{ height: 12 }} />

      <Card>
        <Text style={styles.h}>Profile</Text>
        <Input label="Name" value={name} onChangeText={setName} />
        <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <Button title="Save" onPress={save} />
      </Card>

      <View style={{ height: 12 }} />

      <Card>
        <Text style={styles.h}>Your IDs</Text>
        <Row label="User ID" value={me?.id || '—'} />
      </Card>

      <View style={{ height: 12 }} />

      <Card>
        <Text style={styles.h}>Data</Text>
        <Button title="Export JSON (share)" onPress={exportData} kind="ghost" />
        <View style={{ height: 6 }} />
        <Button title="Reset ALL local data" onPress={nukeAll} />
      </Card>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#fff', padding: 16 },
  h: { fontWeight: '700', marginBottom: 8, color: theme.colors.text },
  row: {
    paddingVertical: 10,
    borderTopColor: theme.colors.line,
    borderTopWidth: 1,
  },
  label: { color: theme.colors.subtext, marginBottom: 2 },
  value: { color: theme.colors.text, fontWeight: '700' },
});
