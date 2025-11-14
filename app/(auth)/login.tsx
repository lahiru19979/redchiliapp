import React, { useState, useEffect } from 'react';

import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
// Note: Assuming AuthContext is available via this relative path in the project structure
import { useAuth } from '../../src/context/AuthContext'; 
// Note: Assuming react-native-reanimated and @expo/vector-icons are available in the runtime environment
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence, 
  withSpring,
  Easing
} from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';

// Animated Button Component for better press feedback
const AnimatedButton = ({ title, onPress, disabled }: { title: string, onPress: () => void, disabled: boolean }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: disabled ? 0.6 : 1,
    };
  });

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    if (!disabled) {
      onPress();
    }
  };

  return (
    <TouchableOpacity 
      onPressIn={handlePressIn} 
      onPressOut={handlePressOut} 
      activeOpacity={1}
      disabled={disabled}
    >
      <Animated.View style={[styles.button, animatedStyle]}>
        <Text style={styles.buttonText}>{title}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Reanimated values for card entry and shake animation
  const cardY = useSharedValue(50);
  const cardOpacity = useSharedValue(0);
  const cardX = useSharedValue(0); // For shake animation

  // Initial Card Entry Animation
  useEffect(() => {
    cardY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) });
    cardOpacity.value = withTiming(1, { duration: 800 });
  }, []);

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: cardY.value }, { translateX: cardX.value }],
      opacity: cardOpacity.value,
    };
  });

  // Shake animation function
  const shakeCard = () => {
    cardX.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 100 }),
      withTiming(-10, { duration: 100 }),
      withTiming(10, { duration: 100 }),
      withTiming(0, { duration: 50 })
    );
  };

  const handleLogin = () => {
    setIsAuthenticating(true);
    setError('');

    // Simulate Network Delay
    setTimeout(() => {
      if (email === 'test@example.com' && password === 'password') {
        const fakeToken = 'user-jwt-12345';
        login(fakeToken); // Success: Triggers state update and redirect
      } else {
        // Failure: Show error and shake the card
        setError("Invalid credentials. Please use 'test@example.com' / 'password'.");
        shakeCard();
      }
      setIsAuthenticating(false);
    }, 1200); // Simulated delay
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}
    >
      <View style={styles.appTitleContainer}>
        
        <Text style={styles.appTitle}>RedChilli</Text>
      </View>

      <Animated.View style={[styles.card, cardAnimatedStyle]}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <View style={styles.inputContainer}>
          <FontAwesome name="envelope" size={18} color="#9ca3af" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            editable={!isAuthenticating}
          />
        </View>

        <View style={styles.inputContainer}>
          <FontAwesome name="lock" size={20} color="#9ca3af" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!isAuthenticating}
          />
        </View>

        {error ? (
          <Animated.Text style={styles.errorText}>
            {error}
          </Animated.Text>
        ) : null}

        <AnimatedButton 
          title={isAuthenticating ? "LOGGING IN..." : "LOG IN"}
          onPress={handleLogin}
          disabled={isAuthenticating}
        />

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#3b82f6', // Light Blue Background
    padding: 20,
  },
  appTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 60,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  title: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    marginBottom: 5, 
    color: '#1f2937' 
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  icon: {
    marginRight: 10,
  },
  input: { 
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    paddingVertical: 10,
  },
  button: {
    backgroundColor: '#10b981', // Emerald Green
    borderRadius: 12,
    paddingVertical: 15,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotPassword: {
    marginTop: 20,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#3b82f6',
    fontSize: 14,
  },
  errorText: {
    color: '#ef4444', // Red
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
    fontWeight: '600',
  },
  appTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 60,
  },
  appIcon: {
    marginRight: 10,
    // Optional: Add a subtle shadow for the icon as well
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
 
});