import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import PasswordToggle from '@/components/PasswordToggle';

export default function SetupMasterPassword() {
    const { setupMasterPassword } = useAuth();
    const router = useRouter();
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({ password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);

    const validatePassword = (pwd: string): string => {
        if (pwd.length < 8) {
            return 'Password must be at least 8 characters long';
        }
        if (!/(?=.*[a-z])/.test(pwd)) {
            return 'Password must contain at least one lowercase letter';
        }
        if (!/(?=.*[A-Z])/.test(pwd)) {
            return 'Password must contain at least one uppercase letter';
        }
        if (!/(?=.*\d)/.test(pwd)) {
            return 'Password must contain at least one number';
        }
        if (!/(?=.*[@$!%*?&])/.test(pwd)) {
            return 'Password must contain at least one special character (@$!%*?&)';
        }
        return '';
    };

    const getPasswordStrength = (pwd: string): { strength: number; label: string; color: string } => {
        let score = 0;
        if (pwd.length >= 8) score += 1;
        if (pwd.length >= 12) score += 1;
        if (/(?=.*[a-z])/.test(pwd)) score += 1;
        if (/(?=.*[A-Z])/.test(pwd)) score += 1;
        if (/(?=.*\d)/.test(pwd)) score += 1;
        if (/(?=.*[@$!%*?&])/.test(pwd)) score += 1;

        if (score <= 2) return { strength: score, label: 'Weak', color: '#DC2626' };
        if (score <= 4) return { strength: score, label: 'Medium', color: '#D97706' };
        return { strength: score, label: 'Strong', color: '#059669' };
    };

    const handleSetup = async () => {
        const passwordError = validatePassword(password);
        const confirmError = password !== confirmPassword ? 'Passwords do not match' : '';

        setErrors({ password: passwordError, confirmPassword: confirmError });

        if (passwordError || confirmError) {
            return;
        }

        setLoading(true);
        try {
            const success = await setupMasterPassword(password);
            if (success) {
                Alert.alert(
                    'Success',
                    'Master password has been set up successfully!',
                    [{ text: 'OK', onPress: () => router.replace('/') }]
                );
            } else {
                Alert.alert('Error', 'Failed to set up master password. Please try again.');
            }
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const passwordStrength = getPasswordStrength(password);

    return (
        <ScrollView className="flex-1 bg-gray-50" keyboardShouldPersistTaps="handled">
            {/* Header */}
            <View className="bg-white pt-12 pb-6 px-6 shadow-sm">
                <View className="items-center mb-4">
                    <View className="bg-blue-100 w-20 h-20 rounded-full items-center justify-center mb-4">
                        <Ionicons name="shield-checkmark" size={40} color="#3B82F6" />
                    </View>
                    <Text className="text-3xl font-bold text-gray-900 mb-2">Setup Master Password</Text>
                    <Text className="text-gray-600 text-base text-center">
                        Create a strong master password to protect all your passwords
                    </Text>
                </View>
            </View>

            <View className="px-4 pt-6">
                {/* Master Password Field */}
                <View className="mb-6">
                    <Text className="text-lg font-semibold text-gray-900 mb-3">Master Password</Text>
                    <View className="relative">
                        <Ionicons 
                            name="key-outline" 
                            size={20} 
                            color="#9CA3AF" 
                            style={{position: 'absolute', left: 16, top: 16, zIndex: 1}} 
                        />
                        <TextInput
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                if (errors.password) setErrors({...errors, password: ''});
                            }}
                            placeholder="Enter master password"
                            secureTextEntry={!showPassword}
                            className={`bg-white border ${errors.password ? 'border-red-300' : 'border-gray-200'} rounded-xl pl-12 pr-12 py-4 text-base shadow-sm`}
                            style={{elevation: 1}}
                        />
                        <PasswordToggle
                            isVisible={showPassword}
                            onToggle={() => setShowPassword(!showPassword)}
                            size={20}
                            color="#9CA3AF"
                            iconVariant="outline"
                        />
                    </View>
                    {errors.password ? (
                        <Text className="text-red-500 text-sm mt-1 ml-2">{errors.password}</Text>
                    ) : null}

                    {/* Password Strength Indicator */}
                    {password.length > 0 && (
                        <View className="mt-3">
                            <View className="flex-row items-center justify-between mb-2">
                                <Text className="text-sm font-medium text-gray-700">Password Strength:</Text>
                                <Text className="text-sm font-semibold" style={{color: passwordStrength.color}}>
                                    {passwordStrength.label}
                                </Text>
                            </View>
                            <View className="flex-row space-x-1">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <View 
                                        key={i}
                                        className="flex-1 h-2 rounded-full"
                                        style={{
                                            backgroundColor: i <= passwordStrength.strength 
                                                ? passwordStrength.color 
                                                : '#E5E7EB'
                                        }}
                                    />
                                ))}
                            </View>
                        </View>
                    )}
                </View>

                {/* Confirm Password Field */}
                <View className="mb-6">
                    <Text className="text-lg font-semibold text-gray-900 mb-3">Confirm Master Password</Text>
                    <View className="relative">
                        <Ionicons 
                            name="key-outline" 
                            size={20} 
                            color="#9CA3AF" 
                            style={{position: 'absolute', left: 16, top: 16, zIndex: 1}} 
                        />
                        <TextInput
                            value={confirmPassword}
                            onChangeText={(text) => {
                                setConfirmPassword(text);
                                if (errors.confirmPassword) setErrors({...errors, confirmPassword: ''});
                            }}
                            placeholder="Confirm master password"
                            secureTextEntry={!showConfirmPassword}
                            className={`bg-white border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-200'} rounded-xl pl-12 pr-12 py-4 text-base shadow-sm`}
                            style={{elevation: 1}}
                        />
                        <PasswordToggle
                            isVisible={showConfirmPassword}
                            onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                            size={20}
                            color="#9CA3AF"
                            iconVariant="outline"
                        />
                    </View>
                    {errors.confirmPassword ? (
                        <Text className="text-red-500 text-sm mt-1 ml-2">{errors.confirmPassword}</Text>
                    ) : null}
                </View>

                {/* Security Notice */}
                <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                    <View className="flex-row items-center mb-2">
                        <Ionicons name="warning" size={20} color="#D97706" style={{marginRight: 8}} />
                        <Text className="text-amber-800 font-semibold">Important</Text>
                    </View>
                    <Text className="text-amber-800 text-sm leading-5">
                        Your master password cannot be recovered if forgotten. Make sure to remember it or store it in a secure location.
                    </Text>
                </View>

                {/* Setup Button */}
                <TouchableOpacity
                    onPress={handleSetup}
                    disabled={loading || !password || !confirmPassword}
                    className={`py-4 rounded-xl mb-6 shadow-sm ${
                        loading || !password || !confirmPassword 
                            ? 'bg-gray-300' 
                            : 'bg-blue-500'
                    }`}
                    style={{elevation: 2}}
                    activeOpacity={0.8}
                >
                    <View className="flex-row items-center justify-center">
                        {loading ? (
                            <>
                                <Ionicons name="reload-outline" size={20} color="white" style={{marginRight: 8}} />
                                <Text className="text-white text-center text-lg font-semibold">Setting up...</Text>
                            </>
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle-outline" size={20} color="white" style={{marginRight: 8}} />
                                <Text className="text-white text-center text-lg font-semibold">Setup Master Password</Text>
                            </>
                        )}
                    </View>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}