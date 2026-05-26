import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useUser } from '@clerk/clerk-expo';
import { useApi } from '../lib/useApi';

const STATUS_COLORS = {
  pending: '#f39c12',
  approved: '#27ae60',
  disputed: '#c0392b',
  paid: '#2980b9',
};

function Badge({ status }) {
  const color = STATUS_COLORS[status] || '#888';
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.badgeText}>{(status || 'none').toUpperCase()}</Text>
    </View>
  );
}

export default function HistoryScreen() {
  const api = useApi();
  const { user } = useUser();
  const [loads, setLoads] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      setLoads(await api.getDriverLoads(user.id));
    } catch (e) {
      console.warn(e);
    } finally {
      setRefreshing(false);
    }
  }, [api, user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={{ padding: 16 }}
      data={loads}
      keyExtractor={(item) => String(item.id)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
      ListEmptyComponent={<Text style={styles.empty}>No load history.</Text>}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.loadNumber}>#{item.load_number}</Text>
            <Text style={styles.facility}>{item.facility_name || '—'}</Text>
            {item.detention?.total_owed != null && (
              <Text style={styles.owed}>${Number(item.detention.total_owed).toFixed(2)}</Text>
            )}
          </View>
          <Badge status={item.detention?.status} />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: '#f5f7fa' },
  row: {
    backgroundColor: '#fff', padding: 14, borderRadius: 10,
    marginBottom: 10, flexDirection: 'row', alignItems: 'center',
  },
  loadNumber: { fontSize: 16, fontWeight: '700' },
  facility: { color: '#666', marginTop: 2 },
  owed: { color: '#0a3d62', fontWeight: '700', marginTop: 4 },
  badge: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  empty: { textAlign: 'center', color: '#888', marginTop: 40 },
});
