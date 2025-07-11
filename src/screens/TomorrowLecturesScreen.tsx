/* ────────────────────────────────────────────────────────────
   src/screens/TomorrowLecturesScreen.tsx
   ──────────────────────────────────────────────────────────── */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';

import { useAuth } from '../contexts/AuthContext';
import { fetchTodayTomorrow } from '../services/lectures';

/* ---------- fixed (light) colour palette ---------- */
const C = {
  surface:  '#ffffff',
  text:     '#1a1a1a',
  subText:  '#3c3c3c',
  link:     '#007aff',
  bg:       '#f5f5f5',
};

export default function TomorrowLecturesScreen() {
  const { student } = useAuth();
  const [lectures, setLectures] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetchTodayTomorrow(student)
      .then(({ tomorrow }) => setLectures(tomorrow))
      .catch(() => Alert.alert('Error', 'Unable to load lectures'))
      .finally(() => setLoading(false));
  }, []);

  /* ---------- UI states ---------- */
  if (loading) {
    return (
      <View style={[s.full, { backgroundColor: C.bg }]}>
        <ActivityIndicator size="large" color={C.link} />
      </View>
    );
  }

  if (!lectures.length) {
    return (
      <View style={[s.full, { backgroundColor: C.bg }]}>
        <Text style={{ color: C.text }}>No Sessions scheduled for tomorrow</Text>
      </View>
    );
  }

  /* ---------- main list ---------- */
  return (
    <FlatList
      contentContainerStyle={[s.container, { backgroundColor: C.bg }]}
      data={lectures}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={[s.card, { backgroundColor: C.surface }]}>
          <Text style={[s.subject, { color: C.text }]}>{item.subject}</Text>

          <Text style={{ color: C.subText }}>👨‍🏫 {item.faculty}</Text>
          <Text style={{ color: C.subText }}>
            ⏰ {item.start} – {item.end}
          </Text>

          {item.mode === 'Online' ? (
            <Text
              style={[s.link, { color: C.link }]}
              onPress={() => item.link && Linking.openURL(item.link)}
            >
              🔗 Join
            </Text>
          ) : (
            <Text style={{ color: C.subText }}>📍 {item.location}</Text>
          )}
        </View>
      )}
    />
  );
}

/* ---------- static styles (colour-agnostic) ---------- */
const s = StyleSheet.create({
  full: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flexGrow: 1,
    padding: 15,
  },
  card: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 1,              // Android shadow
    shadowColor: '#000',       // iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  subject: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  link: {
    textDecorationLine: 'underline',
    marginTop: 6,
  },
});
