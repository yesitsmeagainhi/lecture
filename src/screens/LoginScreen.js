// ─────────────────────────────────────────────────────────
//  src/screens/LoginScreen.js
//  Updated with proper role-based navigation
// ─────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { authenticate } from '../services/googleSheets';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen({ navigation }) {
  const [number,   setNumber]   = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!number || !password) {
      Alert.alert('Error', 'Enter phone & password');
      return;
    }
    setLoading(true);

    try {
      const row = await authenticate(number, password);
      if (!row) {
        Alert.alert('Invalid', 'Number or password incorrect');
        return;
      }

      signIn(row);  // cache user in context

      // Since DashboardWrapper in App.tsx already handles role-based rendering,
      // we just navigate to MainTabs for everyone
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
      
    } catch (err) {
      Alert.alert('Network', err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AbsEdu Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Phone number"
        keyboardType="number-pad"
        value={number}
        onChangeText={setNumber}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button
        title={loading ? 'Checking…' : 'Login'}
        onPress={handleLogin}
        disabled={loading}
      />
      
      {/* Debug hint */}
      <Text style={styles.hint}>
        
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  hint: {
    marginTop: 20,
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
  },
});