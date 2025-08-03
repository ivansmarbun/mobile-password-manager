import React from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

interface AuthGuardProps {
    children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const { isAuthenticated, hasSetupMasterPassword, loading } = useAuth();
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        if (loading) return; // Wait for auth state to load

        const inAuthGroup = segments[0] === 'login' || segments[0] === 'setup-master-password';

        if (!hasSetupMasterPassword) {
            // No master password set up yet
            if (!inAuthGroup) {
                router.replace('/setup-master-password');
            }
        } else if (!isAuthenticated) {
            // Master password is set up but user is not authenticated
            if (!inAuthGroup) {
                router.replace('/login');
            }
        } else {
            // User is authenticated
            if (inAuthGroup) {
                router.replace('/');
            }
        }
    }, [isAuthenticated, hasSetupMasterPassword, loading, segments]);

    // Show loading screen while determining auth state
    if (loading) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <View className="bg-white p-8 rounded-2xl shadow-lg" style={{elevation: 4}}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text className="text-gray-600 text-lg mt-4 text-center">
                        Initializing SecureVault...
                    </Text>
                </View>
            </View>
        );
    }

    // Show app content if authenticated or on auth screens
    return <>{children}</>;
}