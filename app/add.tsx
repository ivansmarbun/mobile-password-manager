import { usePasswordContext } from '@/contexts/PasswordContexts';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AddPassword() {
    const router = useRouter();
    const { addPassword } = usePasswordContext(); // We'll add this function to context next

    // Form state
    const [website, setWebsite] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSave = () => {
        // Basic validation
        if (!website.trim() || !username.trim() || !password.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        // Add the password
        addPassword({
            website: website.trim(),
            username: username.trim(),
            password: password.trim()
        });

        // Clear form and navigate back
        setWebsite('');
        setUsername('');
        setPassword('');
        router.back();
    };

    return (
        <View className="flex-1 pt-12 px-4">
            <Text className="text-2xl font-bold mb-6">Add New Password</Text>

            <View className="mb-4">
                <Text className="text-lg font-semibold mb-2">Website</Text>
                <TextInput
                    value={website}
                    onChangeText={setWebsite}
                    placeholder="Enter website name"
                    className="border border-gray-300 rounded-lg p-3 text-base"
                />
            </View>

            <View className="mb-4">
                <Text className="text-lg font-semibold mb-2">Username</Text>
                <TextInput
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Enter username"
                    className="border border-gray-300 rounded-lg p-3 text-base"
                />
            </View>

            <View className="mb-6">
                <Text className="text-lg font-semibold mb-2">Password</Text>
                <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter password"
                    secureTextEntry={true}
                    className="border border-gray-300 rounded-lg p-3 text-base"
                />
            </View>

            <TouchableOpacity
                onPress={handleSave}
                className="bg-blue-500 py-3 px-6 rounded-lg mb-4"
            >
                <Text className="text-white text-center text-lg font-semibold">Save Password</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => router.back()}
                className="bg-gray-500 py-3 px-6 rounded-lg"
            >
                <Text className="text-white text-center text-lg font-semibold">Cancel</Text>
            </TouchableOpacity>
        </View>
    );
}
