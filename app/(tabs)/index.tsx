import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuth } from '../../src/context/AuthContext'; // Relative path is two levels up

export default function HomeScreen() {
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Home!</Text>
      <Text style={styles.subtitle}>This is a protected route.</Text>
      <Button 
        title="Log Out" 
        onPress={logout} // This triggers the logout state change and redirection
        color="#ff6347" // Tomato red for a clear action
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f0f8ff' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  subtitle: { fontSize: 18, marginBottom: 40, color: '#666' },
});