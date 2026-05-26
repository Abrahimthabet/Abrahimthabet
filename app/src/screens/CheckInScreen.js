import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { useApi } from '../lib/useApi';

export default function CheckInScreen({ route, navigation }) {
  const { loadId, loadNumber } = route.params;
  const api = useApi();
  const [busy, setBusy] = useState(false);

  async function onCheckIn() {
    setBusy(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location required', 'Please enable location to check in.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      await api.checkIn(loadId, {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      navigation.replace('Detention', { loadId });
    } catch (e) {
      Alert.alert('Check-in failed', e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Load #{loadNumber}</Text>
      <Text style={styles.hint}>Tap the button when you arrive at the facility.</Text>

      <TouchableOpacity style={styles.bigBtn} onPress={onCheckIn} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.bigBtnText}>I'M HERE</Text>}
      </TouchableOpacity>

      <Text style={styles.small}>Your GPS location will be recorded.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  label: { fontSize: 18, color: '#555', marginBottom: 4 },
  hint: { color: '#777', marginBottom: 40, textAlign: 'center' },
  bigBtn: {
    backgroundColor: '#27ae60', width: 240, height: 240, borderRadius: 120,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
  bigBtnText: { color: '#fff', fontSize: 32, fontWeight: '800', letterSpacing: 1 },
  small: { color: '#999', marginTop: 32, fontSize: 12 },
});
