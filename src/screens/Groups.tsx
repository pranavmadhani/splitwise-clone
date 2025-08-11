import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Title, Card, Input, Button } from '../ui';
import { theme } from '../theme';
import { offlineGroups } from '../services/offline';

export default function Groups({ navigation }: any) {
  const [groups, setGroups] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('USD');

  async function load() {
    const r = await offlineGroups.list();
    setGroups(r);
  }
  useEffect(() => {
    load();
  }, []);

  async function createGroup() {
    if (!name.trim()) {
      Alert.alert('Name required');
      return;
    }
    await offlineGroups.create(name.trim(), currency.trim() || 'USD');
    setName('');
    setCurrency('USD');
    await load();
  }

  return (
    <View style={styles.wrap}>
      <Title>Groups</Title>
      <View style={{ height: 12 }} />
      <Card>
        <Text style={styles.h}>Create a group</Text>
        <Input label="Group name" value={name} onChangeText={setName} />
        <Input label="Currency" value={currency} onChangeText={setCurrency} />
        <Button title="Create group" onPress={createGroup} />
      </Card>

      <View style={{ height: 12 }} />
      <Card>
        <Text style={styles.h}>Your groups</Text>
        <FlatList
          data={groups}
          keyExtractor={(it) => it.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate('Group', { id: item.id })} style={styles.item}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.cur}>{item.currency}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.cur}>No groups yet.</Text>}
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, backgroundColor: '#fff' },
  h: { fontWeight: '700', marginBottom: 8, color: theme.colors.text },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopColor: theme.colors.line,
    borderTopWidth: 1,
  },
  name: { color: theme.colors.text },
  cur: { color: theme.colors.subtext },
});
