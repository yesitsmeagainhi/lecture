// ────────────────────────────────────────────────────────────
//  src/screens/BranchScheduleScreen.tsx
// ────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import dayjs from 'dayjs';
import { fetchBranchMonth, Session } from '../services/lectures';

interface Props {
  route: { params: { branchName: string } };
}

export default function BranchScheduleScreen({ route }: Props) {
  const branchName = route.params?.branchName ?? '';

  const [rows, setRows] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!branchName) {
      setLoading(false);
      return;
    }
    
    fetchBranchMonth(branchName)
      .then(data => {
        setRows(data);
      })
      .catch(err => {
        console.error('Branch-month fetch failed:', err);
      })
      .finally(() => setLoading(false));
  }, [branchName]);

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#004e92" />
      </View>
    );
  }

  if (!branchName) {
    return (
      <View style={s.center}>
        <Text style={s.errorText}>No branch assigned to this admin account</Text>
      </View>
    );
  }

  if (!rows.length) {
    return (
      <View style={s.center}>
        <Text style={s.infoText}>No sessions scheduled for</Text>
        <Text style={s.branchText}>{branchName} Branch</Text>
        <Text style={s.dateRange}>
          {dayjs().format('DD MMM')} - {dayjs().add(1, 'month').format('DD MMM YYYY')}
        </Text>
      </View>
    );
  }

  // Check if a session is today
  const isToday = (date: string) => {
    return dayjs(date).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD');
  };

  return (
    <View style={s.container}>
      <View style={s.headerContainer}>
        <Text style={s.header}>{branchName} Branch</Text>
        <Text style={s.subHeader}>
          Schedule: {dayjs().format('DD MMM')} - {dayjs().add(1, 'month').format('DD MMM YYYY')}
        </Text>
      </View>
      
      <FlatList
        contentContainerStyle={s.listContent}
        data={rows}
        keyExtractor={r => r.id}
        renderItem={({ item }) => {
          const todaySession = isToday(item.date || '');
          
          return (
            <View style={[s.card, todaySession && s.todayCard]}>
              {todaySession && (
                <View style={s.todayBadge}>
                  <Text style={s.todayBadgeText}>TODAY</Text>
                </View>
              )}
              
              <View style={s.cardHeader}>
                <Text style={[s.subject, todaySession && s.todayText]}>
                  {item.subject}
                </Text>
                <Text style={[s.date, todaySession && s.todayDate]}>
                  {dayjs(item.date).format('DD MMM')}
                </Text>
              </View>
              
              <View style={s.cardBody}>
                <Text style={[s.time, todaySession && s.todayDetails]}>
                  🕐 {item.start} - {item.end}
                </Text>
                <Text style={[s.faculty, todaySession && s.todayDetails]}>
                  👨‍🏫 {item.faculty}
                </Text>
                {item.mode && (
                  <Text style={[s.mode, todaySession && s.todayDetails]}>
                    📍 {item.mode} {item.location ? `- ${item.location}` : ''}
                  </Text>
                )}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f5fa',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f5fa',
    padding: 20,
  },
  headerContainer: {
    backgroundColor: '#004e92',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.9,
  },
  listContent: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    position: 'relative',
  },
  todayCard: {
    backgroundColor: '#e8f5e9',
    borderWidth: 2,
    borderColor: '#4caf50',
    shadowColor: '#4caf50',
    shadowOpacity: 0.2,
    elevation: 4,
  },
  todayBadge: {
    position: 'absolute',
    top: -10,
    right: 10,
    backgroundColor: '#4caf50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todayBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  subject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  todayText: {
    color: '#2e7d32',
  },
  date: {
    fontSize: 14,
    fontWeight: '500',
    color: '#004e92',
    marginLeft: 10,
  },
  todayDate: {
    color: '#2e7d32',
    fontWeight: '700',
  },
  cardBody: {
    gap: 6,
  },
  time: {
    fontSize: 14,
    color: '#555',
  },
  faculty: {
    fontSize: 14,
    color: '#555',
  },
  mode: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  todayDetails: {
    color: '#424242',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  branchText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#004e92',
    textAlign: 'center',
    marginTop: 8,
  },
  dateRange: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
});