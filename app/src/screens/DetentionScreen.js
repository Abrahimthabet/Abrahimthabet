import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useApi } from '../lib/useApi';

const FREE_HOURS = 2;
const HOURLY_RATE = 75;

function format(ms) {
  const sign = ms < 0 ? '-' : '';
  const abs = Math.abs(ms);
  const hours = Math.floor(abs / 3600000);
  const minutes = Math.floor((abs % 3600000) / 60000);
  const seconds = Math.floor((abs % 60000) / 1000);
  const pad = (n) => String(n).padStart(2, '0');
  return `${sign}${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export default function DetentionScreen({ route }) {
  const { loadId } = route.params;
  const api = useApi();
  const [data, setData] = useState(null);
  const [now, setNow] = useState(Date.now());
  const timer = useRef();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getLoad(loadId);
        setData(res);
      } catch (e) {
        console.warn(e);
      }
    })();
  }, [loadId]);

  useEffect(() => {
    timer.current = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer.current);
  }, []);

  if (!data || !data.arrival) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 12 }}>Loading…</Text>
      </View>
    );
  }

  const arrived = new Date(data.arrival.arrived_at).getTime();
  const freeEnd = arrived + FREE_HOURS * 3600000;
  const inDetention = now >= freeEnd;

  const display = inDetention ? now - freeEnd : freeEnd - now;
  const hoursDetained = inDetention ? (now - freeEnd) / 3600000 : 0;
  const owed = (hoursDetained * HOURLY_RATE).toFixed(2);

  return (
    <View style={[styles.container, { backgroundColor: inDetention ? '#c0392b' : '#27ae60' }]}>
      <Text style={styles.label}>Load #{data.load.load_number}</Text>
      <Text style={styles.subLabel}>{data.load.facility_name || ''}</Text>

      <Text style={styles.bigLabel}>
        {inDetention ? 'DETENTION' : 'FREE TIME REMAINING'}
      </Text>
      <Text style={styles.clock}>{format(display)}</Text>

      {inDetention ? (
        <View style={styles.box}>
          <Text style={styles.boxLabel}>Owed</Text>
          <Text style={styles.boxValue}>${owed}</Text>
          <Text style={styles.boxSub}>at ${HOURLY_RATE}/hr</Text>
        </View>
      ) : (
        <Text style={styles.note}>Detention starts in {format(display)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: { color: '#fff', fontSize: 20, fontWeight: '600' },
  subLabel: { color: '#fff', opacity: 0.9, marginBottom: 32 },
  bigLabel: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 2, marginBottom: 12 },
  clock: { color: '#fff', fontSize: 64, fontWeight: '800', fontVariant: ['tabular-nums'] },
  note: { color: '#fff', marginTop: 24, opacity: 0.85 },
  box: {
    marginTop: 32, backgroundColor: 'rgba(0,0,0,0.18)',
    padding: 20, borderRadius: 12, alignItems: 'center', minWidth: 220,
  },
  boxLabel: { color: '#fff', fontSize: 14, opacity: 0.9 },
  boxValue: { color: '#fff', fontSize: 40, fontWeight: '800', marginVertical: 4 },
  boxSub: { color: '#fff', opacity: 0.8, fontSize: 12 },
});
