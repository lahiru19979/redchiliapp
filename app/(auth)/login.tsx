
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Dimensions, KeyboardTypeOptions } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  Easing,
  interpolateColor
} from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; // Requires expo install expo-linear-gradient

const { width, height } = Dimensions.get('window');

// --- Animated Button Component with Loading Indicator ---
const AnimatedButton = ({ title, onPress, disabled, isLoading }: { title: string, onPress: () => void, disabled: boolean, isLoading: boolean }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: disabled ? 0.7 : 1,
    };
  });

  const handlePressIn = () => {
    scale.value = withTiming(0.96, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    if (!disabled && !isLoading) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      disabled={disabled || isLoading}
      style={styles.buttonWrapper}
    >
      <Animated.View style={[animatedStyle, { width: '100%' }]}>
        <LinearGradient
          colors={['#FF5252', '#D50000']} // Brighter red gradient for 'RedChilli' theme
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {isLoading ? (
            <Animated.View style={styles.loadingContainer}>
              {/* Simple Pulsing Dot Animation for Loading */}
              <Animated.Text style={styles.buttonText}>Authenticating...</Animated.Text>
            </Animated.View>
          ) : (
            <Text style={styles.buttonText}>{title}</Text>
          )}
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

// --- Animated Input Component with Focus Effect ---
const AnimatedInput = ({ iconName, placeholder, value, onChangeText, secureTextEntry, keyboardType, editable, isAuthenticating }: { iconName: keyof typeof FontAwesome.glyphMap, placeholder: string, value: string, onChangeText: (text: string) => void, secureTextEntry?: boolean, keyboardType?: KeyboardTypeOptions, editable: boolean, isAuthenticating: boolean }) => {
  const focusAnim = useSharedValue(0); // 0: unfocused, 1: focused
  const inputRef = useRef(null);

  const handleFocus = () => {
    focusAnim.value = withTiming(1, { duration: 300 });
  };

  const handleBlur = () => {
    focusAnim.value = withTiming(0, { duration: 300 });
  };

  const inputAnimatedStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focusAnim.value,
      [0, 1],
      ['#e5e7eb', '#D50000'] // Change border color on focus
    );

    return {
      borderColor: borderColor,
    };
  });

  const magicLineAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: focusAnim.value === 1 ? '100%' : '0%',
      backgroundColor: '#D50000',
      height: 2,
      position: 'absolute',
      bottom: -1,
      left: 0,
      borderRadius: 1,
    };
  });

  return (
    <Animated.View style={[styles.inputContainer, inputAnimatedStyle]}>
      <FontAwesome name={iconName} size={18} color={focusAnim.value === 1 ? '#D50000' : '#9ca3af'} style={styles.icon} />
      <TextInput
        ref={inputRef}
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        keyboardType={keyboardType}
        autoCapitalize="none"
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={onChangeText}
        editable={editable && !isAuthenticating}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      <Animated.View style={magicLineAnimatedStyle} />
    </Animated.View>
  );
};


// --- Main Component ---
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
    cardY.value = withTiming(0, { duration: 700, easing: Easing.out(Easing.back(1)) }); // More bounce
    cardOpacity.value = withTiming(1, { duration: 900 });
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

  const handleLogin = async () => {
  setIsAuthenticating(true);
  setError('');

  try {
    const response = await fetch("https://redchilli.lk/api/auth", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
console.log(response);
    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Login failed");
      shakeCard();
      setIsAuthenticating(false);
      return;
    }

    login(data.token); // <<< store token in context or async storage

  } catch (error) {
    setError("Network error");
    shakeCard();
  }

  setIsAuthenticating(false);
};

  return (
    <LinearGradient
        colors={['#1e40af', '#3b82f6', '#60a5fa']} // Blue gradient background
        style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 20}
      >
        <View style={styles.appTitleContainer}>
          <FontAwesome name="fire" size={40} color="#FF5252" style={styles.appIcon} />
          <Text style={styles.appTitle}>RedChilli.lk</Text>
        </View>

        <Animated.View style={[styles.card, cardAnimatedStyle]}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to access your account</Text>

          <AnimatedInput
            iconName="envelope"
            placeholder="Email Address"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            editable={!isAuthenticating}
            isAuthenticating={isAuthenticating}
          />

          <AnimatedInput
            iconName="lock"
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!isAuthenticating}
            isAuthenticating={isAuthenticating}
          />

          {error ? (
            <Animated.Text style={styles.errorText}>
              {error}
            </Animated.Text>
          ) : null}

          <AnimatedButton
            title={"LOG IN"}
            onPress={handleLogin}
            disabled={isAuthenticating}
            isLoading={isAuthenticating}
          />

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  appTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
  },
  appIcon: {
    marginRight: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  appTitle: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    letterSpacing: 1.5,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1f2937',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 35,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 15,
    marginBottom: 20,
    paddingHorizontal: 15,
    height: 60,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    position: 'relative', // For the magic line
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    paddingVertical: 10,
  },
  buttonWrapper: {
    width: '100%',
  },
  buttonGradient: {
    borderRadius: 15,
    paddingVertical: 18,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D50000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  forgotPassword: {
    marginTop: 25,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: '#D50000', // Deep Red
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 14,
    fontWeight: '700',
  },
});
