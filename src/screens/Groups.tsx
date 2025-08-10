import React, { useEffect, useMemo, useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Title, Card, Input, Button, ListRow, Avatar, Subtitle } from '../ui';
import * as data from '../services/data';
import { theme } from '../theme';

export default function Groups({ navigation }: any) {
  const [groups, setGroups] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [q, setQ] = useState('');

  async function load() {
    const r = await data.listGroups();
    setGroups(r);
  }
  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => groups.filter((g) => g.name?.toLowerCase().includes(q.toLowerCase())), [groups, q]);

  async function createGroup() {
    await data.createGroup(name, currency);
    setName('');
    setCurrency('USD');
    await load();
  }

  return (
    <View style={styles.wrap}>
      <Title style={{ color: '#E4E6E9' as any }}>Groups</Title>
      <Subtitle style={{ color: '#95A0AE' as any }}>Your shared expenses</Subtitle>

      <View style={{ height: 12 }} />

      <Card>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search groups"
          placeholderTextColor={theme.colors.subtext}
          style={styles.search}
        />
        <FlatList
          data={filtered}
          keyExtractor={(it) => it.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate('Group', { id: item.id })}>
              <ListRow
                left={<Avatar name={item.name} />}
                title={item.name}
                caption={`Currency: ${item.currency}`}
                right={<></>}
              />
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Subtitle style={{ marginTop: 8 }}>No groups yet.</Subtitle>}
        />
      </Card>

      <View style={{ height: 12 }} />

      <Card>
        <Title>Create new</Title>
        <Input label="Group name" value={name} onChangeText={setName} />
        <Input label="Currency" value={currency} onChangeText={setCurrency} />
        <Button title="Create group" onPress={createGroup} />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, backgroundColor: '#0B1220' },
  search: {
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: '#FAFBFC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: theme.colors.text,
    marginBottom: 8,
  },
});
