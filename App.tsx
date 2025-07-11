// ─────────────────────────────────────────────────────────
//  App.tsx  –  Login → Bottom Tabs (Student / Teacher / Admin)
// ─────────────────────────────────────────────────────────
import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

/* push-notifications (FCM + notifee) */
import useNotifications from './src/notifications/useNotifications';

/* context */
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

/* dashboards */
import HomeScreen        from './src/screens/HomeScreen';        // student
import TeacherScreen     from './src/screens/TeacherScreen';     // teacher
import AdminHomeScreen   from './src/screens/AdminHomeScreen';   // admin
import HelpDeskScreen    from './src/screens/HelpDeskScreen';

/* detail screens */
import TodayLecturesScreen         from './src/screens/TodayLecturesScreen';
import TomorrowLecturesScreen      from './src/screens/TomorrowLecturesScreen';
import WeekLecturesScreen          from './src/screens/WeekLecturesScreen';
import ImportantAnnouncementScreen from './src/screens/ImportantAnnouncementScreen';
import BranchScheduleScreen        from './src/screens/BranchScheduleScreen';
import TestScreen from './src/screens/TestScreen';

/* auth */
import LoginScreen from './src/screens/LoginScreen';

/* ──────────────────────────────────────────────────────────
   Tiny helper → runs the notification hook once per app-load
   ────────────────────────────────────────────────────────── */
function NotificationGate() {
  useNotifications();   // ✅ ask permission, subscribe to /topics/all, fg-handler
  return null;          // no UI
}

/* decide which dashboard to show */
function DashboardWrapper() {
  const { student } = useAuth();
  
  // Debug logging
  console.log('DashboardWrapper - student:', student);
  console.log('DashboardWrapper - Role:', student?.Role);
  
  // Use capital R for Role (based on your sheet columns)
  const role = (student?.Role || '').toLowerCase().trim();
  
  console.log('DashboardWrapper - normalized role:', role);

  if (role === 'faculty') return <TeacherScreen />;
  if (role === 'admin')   return <AdminHomeScreen />;
  return <HomeScreen />;  // default → student
}

/* navigators */
const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

/* shared bottom-tabs */
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor  : '#004e92',
        tabBarInactiveTintColor: '#8e8e93',
        tabBarIcon: ({ color, size }) => {
          /* two simple emoji icons – replace with any icon library */
          const icon = route.name === 'DashboardTab' ? '🏠' : '💬';
          return <Text style={{ fontSize: size, color }}>{icon}</Text>;
        },
      })}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardWrapper}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="HelpDeskTab"
        component={HelpDeskScreen}
        options={{ title: 'Help Desk' }}
      />
    </Tab.Navigator>
  );
}

/* ──────────────────────────────────────────────────────────
   App root
   ────────────────────────────────────────────────────────── */
export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        {/* initialise FCM the moment the app starts */}
        <NotificationGate />

        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/* 1. Login (no header) */}
            <Stack.Screen name="Login" component={LoginScreen} />

            {/* 2. Tab container (shared by all roles) */}
            <Stack.Screen name="MainTabs" component={MainTabs} />

            {/* 3. Detail routes (reachable from inside the tabs) */}
            <Stack.Screen name="TodayLectures" component={TodayLecturesScreen} />
            <Stack.Screen name="TomorrowLectures" component={TomorrowLecturesScreen} />
            <Stack.Screen name="WeekLectures" component={WeekLecturesScreen} />
            <Stack.Screen
              name="ImportantAnnouncement"
              component={ImportantAnnouncementScreen}
            />
            <Stack.Screen
              name="BranchSchedule"
              component={BranchScheduleScreen}
            />
            {/* Test screen for debugging */}
            <Stack.Screen name="Test" component={TestScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </AuthProvider>
  );
}