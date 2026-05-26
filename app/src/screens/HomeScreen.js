import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useApi } from '../lib/useApi';

export default function HomeScreen({ navigation }) {
  const api = useApi();
  const { user } = useUser();
  const { signOut } = useAuth();
  const [loads, setLoads] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      const data = await api.getDriverLoads(user.id);
      setLoads(data);
    } catch (e) {
      console.warn(e);
    } finally {
      setRefreshing(false);
    }
  }, [api, user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hi, {user?.firstName || 'Driver'}</Text>
        <TouchableOpacity onPress={() => signOut()}>
          <Text style={styles.signOut}>Sign out</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.section}>Active loads</Text>

      <FlatList
        data={loads}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
        ListEmptyComponent={<Text style={styles.empty}>No loads yet. Tap “New Load” to create one.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('LoadDetail', { loadId: item.id })}
          >
            <Text style={styles.loadNumber}>Load #{item.load_number}</Text>
            <Text style={styles.facility}>{item.facility_name || 'No facility'}</Text>
            {item.arrival ? (
              <Text style={styles.status}>Checked in</Text>
            ) : (
              <Text style={styles.statusPending}>Not checked in</Text>
            )}
          </TouchableOpacity>
        )}
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('NewLoad')}>
          <Text style={styles.primaryBtnText}>+ New Load</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('History')}>
          <Text style={styles.secondaryBtnText}>History</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  greeting: { fontSize: 22, fontWeight: '700', color: '#0a3d62' },
  signOut: { color: '#c0392b' },
  section: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 10, marginBottom: 10 },
  loadNumber: { fontSize: 18, fontWeight: '700' },
  facility: { color: '#555', marginTop: 2 },
  status: { marginTop: 6, color: '#27ae60', fontWeight: '600' },
  statusPending: { marginTop: 6, color: '#888' },
  empty: { textAlign: 'center', color: '#888', marginTop: 40 },
  footer: { flexDirection: 'row', gap: 10, marginTop: 12 },
  primaryBtn: { flex: 2, backgroundColor: '#0a3d62', padding: 14, borderRadius: 10 },
  primaryBtnText: { color: '#fff', textAlign: 'center', fontWeight: '700' },
  secondaryBtn: { flex: 1, backgroundColor: '#dfe6e9', padding: 14, borderRadius: 10 },
  secondaryBtnText: { color: '#0a3d62', textAlign: 'center', fontWeight: '700' },
});
