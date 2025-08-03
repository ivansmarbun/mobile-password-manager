import { usePasswordContext } from '@/contexts/PasswordContexts';
import * as Clipboard from 'expo-clipboard';
import React, { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

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
            <View className="flex-1 pt-4">
                <Text className="text-lg text-center">No password selected</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 pt-12 px-4">
            <Text className="text-lg font-bold text-center">{selectedPassword.website}</Text>
            <View className="mb-4">
                <Text className="text-lg font-semibold mb-2">Username</Text>
                <View className="flex-row items-center">
                    <Text
                        className="flex-1 border border-gray-300 rounded-lg p-3 text-base mr-2"
                    >{selectedPassword.username}</Text>
                    <TouchableOpacity
                        onPress={() => copyToClipboard(selectedPassword.username, 'Username')}
                        className="bg-blue-500 px-4 py-3 rounded-lg"
                    >
                        <Text className="text-white font-semibold">Copy</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View className="mb-6">
                <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-lg font-semibold">Password</Text>
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        className="bg-gray-500 px-3 py-1 rounded"
                    >
                        <Text className="text-white text-sm">{showPassword ? 'Hide' : 'Show'}</Text>
                    </TouchableOpacity>
                </View>
                <View className="flex-row items-center">
                    <Text
                        className="flex-1 border border-gray-300 rounded-lg p-3 text-base mr-2"
                    >{showPassword ? selectedPassword.password : '••••••••'}</Text>
                    <TouchableOpacity
                        onPress={() => copyToClipboard(selectedPassword.password, 'Password')}
                        className="bg-blue-500 px-4 py-3 rounded-lg"
                    >
                        <Text className="text-white font-semibold">Copy</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

export default PasswordDetails;
