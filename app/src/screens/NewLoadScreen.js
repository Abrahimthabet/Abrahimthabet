import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useApi } from '../lib/useApi';

export default function NewLoadScreen({ navigation }) {
  const api = useApi();
  const [loadNumber, setLoadNumber] = useState('');
  const [facility, setFacility] = useState('');
  const [appointment, setAppointment] = useState('');
  const [brokerEmail, setBrokerEmail] = useState('');
  const [saving, setSaving] = useState(false);

  async function onSave() {
    if (!loadNumber.trim()) return Alert.alert('Missing field', 'Load number is required');
    setSaving(true);
    try {
      const load = await api.createLoad({
        load_number: loadNumber.trim(),
        facility_name: facility.trim() || null,
        appointment_time: appointment.trim() || null,
        broker_email: brokerEmail.trim() || null,
      });
      navigation.replace('CheckIn', { loadId: load.id, loadNumber: load.load_number });
    } catch (e) {
      Alert.alert('Could not save', e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Load number *</Text>
      <TextInput style={styles.input} value={loadNumber} onChangeText={setLoadNumber} />

      <Text style={styles.label}>Facility name</Text>
      <TextInput style={styles.input} value={facility} onChangeText={setFacility} />

      <Text style={styles.label}>Appointment time (ISO)</Text>
      <TextInput
        style={styles.input}
        value={appointment}
        onChangeText={setAppointment}
        placeholder="2026-05-26T14:00:00Z"
      />

      <Text style={styles.label}>Broker email</Text>
      <TextInput
        style={styles.input}
        value={brokerEmail}
        onChangeText={setBrokerEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TouchableOpacity style={styles.button} onPress={onSave} disabled={saving}>
        <Text style={styles.buttonText}>{saving ? 'Saving…' : 'Save & Continue'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
  label: { fontWeight: '600', marginTop: 12, marginBottom: 6, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16 },
  button: { backgroundColor: '#0a3d62', padding: 16, borderRadius: 8, marginTop: 24 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 16 },
});
