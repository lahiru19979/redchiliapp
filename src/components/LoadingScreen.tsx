import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing,
  interpolate,
  withSequence
} from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';

// Define the animated logo component
const AnimatedChiliLogo = () => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0.8);

  // Animation logic: runs once when the component mounts
  useEffect(() => {
    // Rotation animation: Repeats indefinitely
    rotation.value = withRepeat(
      withTiming(360, { duration: 2000, easing: Easing.linear }),
      -1, // -1 means infinite loop
      false // Do not reverse
    );

    // Scaling animation: subtle pulse effect
    scale.value = withRepeat(
      withSequence(
        withTiming(1.0, { duration: 500 }),
        withTiming(0.8, { duration: 500 }),
      ),
      -1,
      true // Reverse the animation
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}deg` },
        { scale: scale.value }
      ],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <FontAwesome name="fire" size={80} color="#ff6347" />
    </Animated.View>
  );
};

export default function LoadingScreen() {
  const textOpacity = useSharedValue(0);

  // Text fade-in animation
  useEffect(() => {
    textOpacity.value = withTiming(1, { duration: 1000, easing: Easing.ease });
  }, []);

  const textAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value,
    };
  });

  return (
    <View style={styles.container}>
      <AnimatedChiliLogo />
      
      <Animated.View style={textAnimatedStyle}>
        <Text style={styles.loadingText}>RedChilli</Text>
        <Text style={styles.tagline}>Loading the heat...</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3b82f6', // Matches your Login screen background
  },
  loadingText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#fff',
    marginTop: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 5,
  },
});