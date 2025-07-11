// ────────────────────────────────────────────────────────────
//  src/screens/AdminHomeScreen.tsx
// ────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import BannerSlider, { BANNER_HEIGHT } from '../components/BannerSlider';
import { fetchBanners } from '../services/lectures';

/* palette / helpers ---------------------------------------------------------*/
const PALETTE = {
  blue: '#004e92',
  textMain: '#1a1a1a',
  textMute: '#686868',
  surface: '#ffffff',
  bg: '#f2f5fa',
};

const shadow = (e: number = 4) =>
  Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: e / 2 },
      shadowOpacity: 0.08,
      shadowRadius: e,
    },
    android: { elevation: e },
  });

/* ──────────────────────────────────────────────────────────*/
export default function AdminHomeScreen() {
  const { student, logOut } = useAuth();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  
  // Use capital F for Faculty (based on your sheet columns)
  const branchName = student?.Faculty || '';
  
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const rows = await fetchBanners();
        const active = rows.filter(r => (r.isActive ?? 'true').toLowerCase() === 'true');
        setBanners(active);
      } catch (err) {
        console.warn('Banner fetch failed:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={PALETTE.blue} />

      {/* HEADER - matching HomeScreen style */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.welcome}>Admin Dashboard 🛡️</Text>
            <Text style={styles.userName}>{student?.name ?? 'Admin'}</Text>
            <Text style={styles.branchInfo}>{branchName} Branch</Text>
          </View>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => {
              logOut();
              navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            }}
          >
            <Text style={styles.logoutTxt}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* BODY */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View style={styles.body}>
          
          {/* BANNERS */}
          <View style={styles.bannerFrame}>
            {loading ? (
              <ActivityIndicator size="large" color={PALETTE.blue} style={{ flex: 1 }} />
            ) : (
              <BannerSlider banners={banners} />
            )}
          </View>

          {/* ADMIN MENU */}
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <View style={styles.menuRow}>
              <MenuCard
                icon="📚"
                label="Branch Schedule"
                hint={`View ${branchName || 'your branch'} timetable`}
                style={{ marginRight: 8 }}
                onPress={() => {
                  if (!branchName) {
                    return;
                  }
                  navigation.navigate('BranchSchedule', { branchName });
                }}
              />
              
              <MenuCard
                icon="📢"
                label="Announcements"
                hint="View all announcements"
                style={{ marginLeft: 8 }}
                onPress={() => navigation.navigate('ImportantAnnouncement')}
              />
            </View>
            
            
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/* card component */
function MenuCard({
  icon,
  label,
  hint,
  onPress,
  style,
  disabled = false,
}: {
  icon: string;
  label: string;
  hint: string;
  onPress: () => void;
  style?: any;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={disabled ? 1 : 0.85}
      onPress={disabled ? undefined : onPress}
      style={[styles.menuCard, style]}
    >
      <View style={styles.cardInner}>
        <Text style={styles.cardIcon}>{icon}</Text>
        <Text style={styles.cardLabel}>{label}</Text>
        <Text style={styles.cardHint}>{hint}</Text>
      </View>
    </TouchableOpacity>
  );
}

/* styles */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PALETTE.bg },
  
  // Header styles matching HomeScreen
  header: {
    backgroundColor: PALETTE.blue,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
    ...shadow(6),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcome: { color: '#cfe3ff', fontSize: 15 },
  userName: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 2 },
  branchInfo: { color: '#cfe3ff', fontSize: 14, marginTop: 2 },
  logoutBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  logoutTxt: { color: '#fff', fontWeight: '600' },
  
  // Body styles
  scroll: { flex: 1 },
  body: { paddingHorizontal: 18, paddingTop: 26 },
  
  // Banner styles
  bannerFrame: {
    width: '100%',
    height: BANNER_HEIGHT,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#dcdcdc',
    ...shadow(3),
  },
  
  // Menu styles
  menuSection: { marginTop: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: PALETTE.textMain,
    marginBottom: 16,
  },
  menuRow: { flexDirection: 'row' },
  menuCard: {
    flex: 1,
    backgroundColor: PALETTE.surface,
    borderRadius: 16,
    paddingVertical: 26,
    paddingHorizontal: 16,
    ...shadow(4),
  },
  cardInner: { alignItems: 'center' },
  cardIcon: { fontSize: 40, marginBottom: 12 },
  cardLabel: { fontSize: 16, fontWeight: '600', color: PALETTE.textMain },
  cardHint: {
    fontSize: 13,
    color: PALETTE.textMute,
    marginTop: 4,
    textAlign: 'center',
  },
});