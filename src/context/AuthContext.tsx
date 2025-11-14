import { createContext, useContext, useState, useEffect, type PropsWithChildren } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { Text } from 'react-native'; // Used for the simple loading screen

// --- Type Definitions ---
interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// --- Protected Route Logic Hook ---
function useProtectedRoute(isAuthenticated: boolean, isLoading: boolean) {
  const segments = useSegments();
  const router = useRouter();

  // This effect runs whenever auth state or segments change
  useEffect(() => {
    // Wait until initial loading is complete
    if (isLoading) return;

    // Check if the current route is within the authentication group, which we named '(auth)'
    const inAuthGroup = (segments as string[])[0] === '(auth)';

    if (
      // If NOT authenticated AND NOT in the auth group, redirect to login
      !isAuthenticated && !inAuthGroup
    ) {
      router.replace('/login' as any);
    } else if (
      // If authenticated AND currently in the auth group, redirect to home ('/')
      isAuthenticated && inAuthGroup
    ) {
      router.replace('/' as any);
    }
  }, [isAuthenticated, isLoading, segments]);
}

// --- Auth Provider Component ---
export function AuthProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Hook into the protection logic
  useProtectedRoute(isAuthenticated, isLoading);

  // Simulate checking for a stored token on app start
  useEffect(() => {
    // In a real app, you would read SecureStore here.
    const checkToken = () => {
        // Simulating a fast check
        setTimeout(() => {
            // If token found: setIsAuthenticated(true);
            setIsLoading(false);
        }, 800); 
    };
    checkToken();
  }, []);

  const login = (token: string) => {
    // 1. Save token securely (e.g., SecureStore)
    console.log("Token saved:", token);
    
    // 2. Update state to trigger redirect to '/'
    setIsAuthenticated(true);
  };

  const logout = () => {
    // 1. Clear token securely
    console.log("Token cleared.");
    
    // 2. Update state to trigger redirect to '/login'
    setIsAuthenticated(false);
  };
  
  // Show a basic loading screen while checking the initial auth state
  if (isLoading) {
      return <Text style={{ flex: 1, textAlign: 'center', marginTop: 50, fontSize: 18 }}>Loading App...</Text>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};