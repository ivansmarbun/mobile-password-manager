import { usePasswordContext } from '@/contexts/PasswordContexts';
import * as Clipboard from 'expo-clipboard';
import React, { useState } from 'react';
import { Alert, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PasswordDetails = () => {
    const { selectedPassword } = usePasswordContext();
    const [showPassword, setShowPassword] = useState(false);

    const copyToClipboard = async (text: string, type: string) => {
        try {
            await Clipboard.setStringAsync(text);
            Alert.alert('Copied!', `${type} copied to clipboard`);
            
            if (type === 'Password') {
                setTimeout(async () => {
                    try {
                        const currentClipboard = await Clipboard.getStringAsync();
                        if (currentClipboard === text) {
                            await Clipboard.setStringAsync('');
                        }
                    } catch (error) {
                    }
                }, 30000);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to copy to clipboard');
        }
    };

    if (!selectedPassword) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <Ionicons name="lock-closed-outline" size={64} color="#D1D5DB" />
                <Text className="text-xl font-medium text-gray-500 mt-4">No password selected</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white pt-12 pb-6 px-6 shadow-sm">
                <View className="flex-row items-center mb-2">
                    <View className="bg-blue-100 w-16 h-16 rounded-full items-center justify-center mr-4">
                        <Ionicons name="globe-outline" size={32} color="#3B82F6" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-2xl font-bold text-gray-900">{selectedPassword.website}</Text>
                        <Text className="text-gray-600 text-base">Account Details</Text>
                    </View>
                </View>
            </View>

            <View className="px-4 pt-6">
                {/* Username Card */}
                <View className="bg-white rounded-xl p-5 mb-4 shadow-sm" style={{elevation: 2}}>
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center">
                            <Ionicons name="person-outline" size={20} color="#6B7280" style={{marginRight: 8}} />
                            <Text className="text-lg font-semibold text-gray-900">Username</Text>
                        </View>
                    </View>
                    <View className="flex-row items-center">
                        <View className="flex-1 bg-gray-50 rounded-lg p-4 mr-3">
                            <Text className="text-base text-gray-800 font-medium">{selectedPassword.username}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => copyToClipboard(selectedPassword.username, 'Username')}
                            className="bg-blue-500 p-3 rounded-lg"
                            activeOpacity={0.8}
                        >
                            <Ionicons name="copy-outline" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Password Card */}
                <View className="bg-white rounded-xl p-5 mb-6 shadow-sm" style={{elevation: 2}}>
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center">
                            <Ionicons name="key-outline" size={20} color="#6B7280" style={{marginRight: 8}} />
                            <Text className="text-lg font-semibold text-gray-900">Password</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            className="bg-gray-100 px-3 py-2 rounded-lg"
                            activeOpacity={0.7}
                        >
                            <View className="flex-row items-center">
                                <Ionicons 
                                    name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                                    size={16} 
                                    color="#6B7280" 
                                    style={{marginRight: 4}} 
                                />
                                <Text className="text-gray-700 font-medium text-sm">{showPassword ? 'Hide' : 'Show'}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View className="flex-row items-center">
                        <View className="flex-1 bg-gray-50 rounded-lg p-4 mr-3">
                            <Text className="text-base text-gray-800 font-medium">
                                {showPassword ? selectedPassword.password : '••••••••'}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => copyToClipboard(selectedPassword.password, 'Password')}
                            className="bg-blue-500 p-3 rounded-lg"
                            activeOpacity={0.8}
                        >
                            <Ionicons name="copy-outline" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Security Notice */}
                <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                    <View className="flex-row items-center">
                        <Ionicons name="shield-checkmark-outline" size={20} color="#D97706" style={{marginRight: 8}} />
                        <Text className="text-amber-800 font-medium flex-1">
                            Passwords auto-clear from clipboard after 30 seconds for security
                        </Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

export default PasswordDetails;
