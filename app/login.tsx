import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import PasswordToggle from '@/components/PasswordToggle';

export default function Login() {
    const { login, biometricCapabilities, isBiometricEnabled, authenticateWithBiometric } = useAuth();
    
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [biometricLoading, setBiometricLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (!password.trim()) {
            setError('Please enter your master password');
            return;
        }

        setLoading(true);
        setError('');
        
        try {
            const success = await login(password);
            if (!success) {
                setError('Incorrect master password. Please try again.');
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleBiometricLogin = async () => {
        setBiometricLoading(true);
        setError('');
        
        try {
            const result = await authenticateWithBiometric();
            if (!result.success) {
                if (result.errorType !== 'user_cancel') {
                    setError(result.error || 'Biometric authentication failed');
                }
            }
        } catch (error) {
            setError('An error occurred during biometric authentication');
        } finally {
            setBiometricLoading(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-gray-50" keyboardShouldPersistTaps="handled">
            {/* Header */}
            <View className="bg-white pt-16 pb-8 px-6 shadow-sm">
                <View className="items-center">
                    <View className="bg-blue-100 w-24 h-24 rounded-full items-center justify-center mb-6">
                        <Ionicons name="lock-closed" size={48} color="#3B82F6" />
                    </View>
                    <Text className="text-4xl font-bold text-gray-900 mb-2">SecureVault</Text>
                    <Text className="text-gray-600 text-lg text-center">
                        Enter your master password to access your passwords
                    </Text>
                </View>
            </View>

            <View className="px-6 pt-8">
                {/* Master Password Input */}
                <View className="mb-6">
                    <Text className="text-xl font-semibold text-gray-900 mb-4">Master Password</Text>
                    <View className="relative">
                        <Ionicons 
                            name="key" 
                            size={24} 
                            color="#9CA3AF" 
                            style={{position: 'absolute', left: 20, top: 18, zIndex: 1}} 
                        />
                        <TextInput
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                if (error) setError('');
                            }}
                            placeholder="Enter your master password"
                            secureTextEntry={!showPassword}
                            className={`bg-white border ${error ? 'border-red-300' : 'border-gray-300'} rounded-2xl pl-16 pr-16 py-5 text-lg shadow-sm`}
                            style={{elevation: 2}}
                            autoFocus
                            blurOnSubmit={false}
                            keyboardType="default"
                        />
                        <PasswordToggle
                            isVisible={showPassword}
                            onToggle={() => setShowPassword(!showPassword)}
                            size={24}
                            color="#9CA3AF"
                        />
                    </View>
                    {error ? (
                        <View className="flex-row items-center mt-3">
                            <Ionicons name="alert-circle" size={16} color="#DC2626" style={{marginRight: 6}} />
                            <Text className="text-red-600 text-base">{error}</Text>
                        </View>
                    ) : null}
                </View>

                {/* Login Button */}
                <TouchableOpacity
                    onPress={handleLogin}
                    disabled={loading || !password.trim()}
                    className={`py-5 rounded-2xl mb-6 shadow-lg ${
                        loading || !password.trim() 
                            ? 'bg-gray-300' 
                            : 'bg-blue-500'
                    }`}
                    style={{elevation: 4}}
                    activeOpacity={0.8}
                >
                    <View className="flex-row items-center justify-center">
                        {loading ? (
                            <>
                                <Ionicons name="reload-outline" size={24} color="white" style={{marginRight: 10}} />
                                <Text className="text-white text-center text-xl font-bold">Authenticating...</Text>
                            </>
                        ) : (
                            <>
                                <Ionicons name="lock-open" size={24} color="white" style={{marginRight: 10}} />
                                <Text className="text-white text-center text-xl font-bold">Unlock</Text>
                            </>
                        )}
                    </View>
                </TouchableOpacity>

                {/* Biometric Authentication Button */}
                {isBiometricEnabled && biometricCapabilities?.isAvailable && (
                    <>
                        <View className="flex-row items-center justify-center my-6">
                            <View className="flex-1 h-px bg-gray-300"></View>
                            <Text className="mx-4 text-gray-500 text-base">or</Text>
                            <View className="flex-1 h-px bg-gray-300"></View>
                        </View>

                        <TouchableOpacity
                            onPress={handleBiometricLogin}
                            disabled={biometricLoading}
                            className={`py-5 rounded-2xl mb-6 shadow-lg ${
                                biometricLoading ? 'bg-gray-300' : 'bg-green-500'
                            }`}
                            style={{elevation: 4}}
                            activeOpacity={0.8}
                        >
                            <View className="flex-row items-center justify-center">
                                {biometricLoading ? (
                                    <>
                                        <Ionicons name="reload-outline" size={24} color="white" style={{marginRight: 10}} />
                                        <Text className="text-white text-center text-xl font-bold">Authenticating...</Text>
                                    </>
                                ) : (
                                    <>
                                        <Ionicons 
                                            name={biometricCapabilities?.icon === 'face-recognition' ? 'scan' : 'finger-print'} 
                                            size={24} 
                                            color="white" 
                                            style={{marginRight: 10}} 
                                        />
                                        <Text className="text-white text-center text-xl font-bold">
                                            Use {biometricCapabilities?.primaryType}
                                        </Text>
                                    </>
                                )}
                            </View>
                        </TouchableOpacity>
                    </>
                )}

                {/* Security Features Info */}
                <View className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mt-8">
                    <View className="flex-row items-center mb-3">
                        <Ionicons name="shield-checkmark" size={24} color="#3B82F6" style={{marginRight: 10}} />
                        <Text className="text-blue-900 font-bold text-lg">Your Data is Secure</Text>
                    </View>
                    <Text className="text-blue-800 text-base leading-6">
                        • All passwords are encrypted with AES-256{'\n'}
                        • Master password is hashed with SHA-256{'\n'}
                        • Data is stored securely on your device{'\n'}
                        • No data is sent to external servers
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}