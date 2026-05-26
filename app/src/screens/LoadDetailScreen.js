import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useApi } from '../lib/useApi';

export default function LoadDetailScreen({ route, navigation }) {
  const { loadId } = route.params;
  const api = useApi();
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      try { setData(await api.getLoad(loadId)); } catch (e) { console.warn(e); }
    })();
  }, [loadId]);

  if (!data) return <View style={styles.center}><ActivityIndicator /></View>;

  const { load, arrival, detention_live } = data;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>#{load.load_number}</Text>
      <Text style={styles.label}>Facility: <Text style={styles.value}>{load.facility_name || '—'}</Text></Text>
      <Text style={styles.label}>Broker: <Text style={styles.value}>{load.broker_email || '—'}</Text></Text>
      <Text style={styles.label}>Appointment: <Text style={styles.value}>{load.appointment_time || '—'}</Text></Text>

      {arrival ? (
        <>
          <Text style={styles.label}>Arrived: <Text style={styles.value}>{new Date(arrival.arrived_at).toLocaleString()}</Text></Text>
          <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Detention', { loadId })}>
            <Text style={styles.btnText}>Open Detention Clock</Text>
          </TouchableOpacity>
          {detention_live && (
            <Text style={styles.label}>
              Live owed: <Text style={styles.value}>${detention_live.total_owed.toFixed(2)}</Text>
            </Text>
          )}
        </>
      ) : (
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: '#27ae60' }]}
          onPress={() => navigation.navigate('CheckIn', { loadId, loadNumber: load.load_number })}
        >
          <Text style={styles.btnText}>I'm Here — Check In</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 20, color: '#0a3d62' },
  label: { fontSize: 15, color: '#555', marginBottom: 8 },
  value: { color: '#111', fontWeight: '600' },
  btn: { backgroundColor: '#0a3d62', padding: 14, borderRadius: 10, marginTop: 20 },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 16 },
});
