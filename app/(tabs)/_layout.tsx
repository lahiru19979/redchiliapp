// import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

// Reusable Tab Bar Icon component
function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string }) {
  return <FontAwesome size={22} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabsLayout() {
  return (
    // The Tabs component replaces Stack here, creating the bottom bar
    <Tabs screenOptions={{ 
        tabBarActiveTintColor: 'blue', 
        headerShown: false // Hide the header by default, or set it per screen
    }}>
      
      {/* Route: / */}
      <Tabs.Screen
        name="index" // Corresponds to app/(tabs)/index.tsx
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      
      {/* Route: /profile */}
      <Tabs.Screen
        name="profile" // Corresponds to app/(tabs)/profile.tsx
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
      
    </Tabs>
  );
}