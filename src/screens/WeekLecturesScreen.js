// ─────────────────────────────────────────────────────────
//  src/screens/WeekLecturesScreen.js
//  Teacher 7-day schedule – today highlighted in green
// ─────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, Alert, Linking,
} from 'react-native';
import { useAuth }        from '../contexts/AuthContext';
import { fetchTeacherWeek } from '../services/lectures';

export default function WeekLecturesScreen() {
  const { student } = useAuth();
  const [data, setData]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherWeek(student?.name ?? '')
      .then(setData)
      .catch(() => Alert.alert('Error', 'Could not load week schedule'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#004e92" />
      </View>
    );
  }

  if (!data.length) {
    return (
      <View style={s.center}>
        <Text>No lectures in the next 7 days 🎉</Text>
      </View>
    );
  }

  const todayISO = new Date().toISOString().slice(0, 10);

  return (
    <FlatList
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      data={data}
      keyExtractor={item => item.id}
      renderItem={({ item }) => {
        const isToday = item.date === todayISO;
        return (
          <View style={[s.card, isToday && s.todayCard]}>
            <Text style={s.subj}>{item.subject}</Text>
            <Text style={s.date}>
              📅 {item.date}   ⏰ {item.start}–{item.end}
            </Text>
            {item.mode === 'Online' && item.link ? (
              <Text style={s.link} onPress={() => Linking.openURL(item.link)}>
                🔗 Join Link
              </Text>
            ) : (
              <Text style={s.room}>{item.location}</Text>
            )}
          </View>
        );
      }}
    />
  );
}

const s = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  /* cards */
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },

  /* today highlight - green background */
  todayCard: {
    backgroundColor: '#dcfce7', // Light green background
    borderColor: '#16a34a',     // Green border
    borderWidth: 1,
  },

  /* text */
  subj : { fontSize: 17, fontWeight: '600', marginBottom: 4 },
  date : { fontSize: 14, color: '#555', marginBottom: 4 },
  room : { fontSize: 14, color: '#777' },
  link : { fontSize: 14, color: '#2563eb', textDecorationLine: 'underline' },
});