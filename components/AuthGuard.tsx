import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useInactivityTimer } from '@/hooks/useInactivityTimer';

interface AuthGuardProps {
    children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const { 
        isAuthenticated, 
        hasSetupMasterPassword, 
        loading, 
        isBiometricEnabled, 
        authenticateWithBiometric,
        isAppLockEnabled,
        appLockTimeout,
        lockApp,
        isManualLogout
    } = useAuth();
    const router = useRouter();
    const segments = useSegments();
    const [biometricPrompted, setBiometricPrompted] = useState(false);

    // Handle inactivity timeout
    const handleInactivityTimeout = () => {
        if (isAuthenticated && isAppLockEnabled) {
            setBiometricPrompted(false); // Reset biometric prompt state
            lockApp();
        }
    };

    // Setup inactivity timer
    const { panResponder } = useInactivityTimer({
        onInactivityTimeout: handleInactivityTimeout,
        timeoutMinutes: appLockTimeout,
        enabled: isAuthenticated && isAppLockEnabled
    });

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
                // Check if biometric is enabled, not already prompted, and not a manual logout
                if (isBiometricEnabled && !biometricPrompted && !isManualLogout) {
                    setBiometricPrompted(true);
                    // Attempt biometric authentication first
                    authenticateWithBiometric().then((result) => {
                        if (!result.success) {
                            // If biometric fails, redirect to login screen
                            router.replace('/login');
                        }
                        // If successful, user will be authenticated automatically
                    }).catch(() => {
                        // If error occurs, fallback to login screen
                        router.replace('/login');
                    });
                } else {
                    // Always redirect to login if not trying biometric authentication
                    router.replace('/login');
                }
            }
        } else {
            // User is authenticated
            if (inAuthGroup) {
                router.replace('/');
            }
            // Reset biometric prompted state when authenticated
            setBiometricPrompted(false);
        }
    }, [isAuthenticated, hasSetupMasterPassword, loading, segments, isBiometricEnabled, biometricPrompted, isManualLogout, router, authenticateWithBiometric]);

    // Reset biometric prompted state when user becomes unauthenticated
    useEffect(() => {
        if (!isAuthenticated && !loading) {
            setBiometricPrompted(false);
        }
    }, [isAuthenticated, loading]);

    // Force redirect when app lock occurs
    useEffect(() => {
        if (!isAuthenticated && !loading && hasSetupMasterPassword) {
            const inAuthGroup = segments[0] === 'login' || segments[0] === 'setup-master-password';
            if (!inAuthGroup) {
                // Force immediate redirect to login if not already on auth screen
                setTimeout(() => {
                    if (isBiometricEnabled && !isManualLogout) {
                        // Try biometric first
                        setBiometricPrompted(true);
                        authenticateWithBiometric().then((result) => {
                            if (!result.success) {
                                router.replace('/login');
                            }
                        }).catch(() => {
                            router.replace('/login');
                        });
                    } else {
                        router.replace('/login');
                    }
                }, 100); // Small delay to ensure state has updated
            }
        }
    }, [isAuthenticated, loading, hasSetupMasterPassword, segments, isBiometricEnabled, isManualLogout, router, authenticateWithBiometric]);

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
    // Wrap with pan responder to detect touch events for inactivity timer
    return (
        <View style={{ flex: 1 }} {...(isAuthenticated && isAppLockEnabled ? panResponder.panHandlers : {})}>
            {children}
        </View>
    );
}