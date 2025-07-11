// ────────────────────────────────────────────────────────────
//  Create a test file: src/screens/TestScreen.tsx
//  This will help us debug what's happening
// ────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { sheetURL, toObjects } from '../services/lectures';

export default function TestScreen() {
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState<any[]>([]);
  const [lectureData, setLectureData] = useState<any[]>([]);

  useEffect(() => {
    const fetchDebugData = async () => {
      try {
        // Fetch students data
        const studRes = await fetch(sheetURL('students!A:K'));
        const studData = await studRes.json();
        const students = toObjects(studData.values);
        setStudentData(students);

        // Fetch lectures data
        const lectRes = await fetch(sheetURL('Lectures!A:M'));
        const lectData = await lectRes.json();
        const lectures = toObjects(lectData.values);
        setLectureData(lectures);

      } catch (error) {
        console.error('Debug fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDebugData();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Find Meera Patel
  const meera = studentData.find(s => s.name === 'Meera Patel');
  
  // Find Kurla lectures
  const kurlaLectures = lectureData.filter(l => 
    l.branch && l.branch.toLowerCase().includes('kurla')
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Debug Information</Text>
      
      <Text style={styles.section}>Meera Patel's Data:</Text>
      <Text style={styles.code}>{JSON.stringify(meera, null, 2)}</Text>
      
      <Text style={styles.section}>Available Keys in Student Object:</Text>
      <Text style={styles.code}>{meera ? Object.keys(meera).join(', ') : 'Not found'}</Text>
      
      <Text style={styles.section}>First 3 Students:</Text>
      <Text style={styles.code}>
        {JSON.stringify(studentData.slice(0, 3), null, 2)}
      </Text>
      
      <Text style={styles.section}>Kurla Lectures Count: {kurlaLectures.length}</Text>
      
      <Text style={styles.section}>First 3 Lectures:</Text>
      <Text style={styles.code}>
        {JSON.stringify(lectureData.slice(0, 3), null, 2)}
      </Text>
      
      <Text style={styles.section}>Kurla Lectures:</Text>
      <Text style={styles.code}>
        {JSON.stringify(kurlaLectures.slice(0, 3), null, 2)}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  code: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#666',
  },
});