import { usePasswordContext } from '@/contexts/PasswordContexts';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';

// Password generation configuration
const PASSWORD_CONFIG = {
    length: 16,
    characterSets: {
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        numbers: '0123456789',
        symbols: '!@#$%^&*'
    },
    // Combine all character sets for password generation
    getAllCharacters() {
        return Object.values(this.characterSets).join('');
    }
};

const EditPassword = () => {
    const router = useRouter();
    const { selectedPassword, setSelectedPassword, updatePassword } = usePasswordContext();

    if (!selectedPassword) {
        return (
            <View className="flex-1 pt-12 px-4">
                <Text className="text-lg text-center">No password selected for editing</Text>
            </View>
        );
    }

    // Form state
    const [website, setWebsite] = useState(selectedPassword.website);
    const [username, setUsername] = useState(selectedPassword.username);
    const [password, setPassword] = useState(selectedPassword.password);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({ website: '', username: '', password: '' });

    const validateForm = () => {
        const newErrors = { website: '', username: '', password: '' };
        let isValid = true;

        if (!website.trim()) {
            newErrors.website = 'Website is required';
            isValid = false;
        }
        if (!username.trim()) {
            newErrors.username = 'Username is required';
            isValid = false;
        }
        if (!password.trim()) {
            newErrors.password = 'Password is required';
            isValid = false;
        } else if (password.length < 4) {
            newErrors.password = 'Password must be at least 4 characters';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            const updatedPasswordData = {
                website: website.trim(),
                username: username.trim(),
                password: password.trim()
            };

            await updatePassword(selectedPassword.id, updatedPasswordData);
            setSelectedPassword({ ...selectedPassword, ...updatedPasswordData });

            // Clear errors and navigate back
            setErrors({ website: '', username: '', password: '' });
            router.back();
        } catch (error) {
            Alert.alert('Error', 'Failed to update password. Please try again.');
        }
    };

    const generatePassword = async () => {
        try {
            const chars = PASSWORD_CONFIG.getAllCharacters();
            const randomBytes = await Crypto.getRandomBytesAsync(PASSWORD_CONFIG.length);
            
            // Convert bytes to password characters
            let result = '';
            for (let i = 0; i < PASSWORD_CONFIG.length; i++) {
                result += chars.charAt(randomBytes[i] % chars.length);
            }
            
            setPassword(result);
            setShowPassword(true);
        } catch (error) {
            console.error('Error generating password:', error);
            // Fallback to Math.random if crypto fails
            const chars = PASSWORD_CONFIG.getAllCharacters();
            let result = '';
            for (let i = 0; i < PASSWORD_CONFIG.length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            setPassword(result);
            setShowPassword(true);
        }
    };

    return (
        <ScrollView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white pt-12 pb-6 px-6 shadow-sm">
                <Text className="text-3xl font-bold text-gray-900 mb-2">Edit Password</Text>
                <Text className="text-gray-600 text-base">Update your secure entry</Text>
            </View>

            <View className="px-4 pt-6">
                {/* Website Field */}
                <View className="mb-6">
                    <Text className="text-lg font-semibold text-gray-900 mb-3">Website</Text>
                    <View className="relative">
                        <Ionicons 
                            name="globe-outline" 
                            size={20} 
                            color="#9CA3AF" 
                            style={{position: 'absolute', left: 16, top: 16, zIndex: 1}} 
                        />
                        <TextInput
                            value={website}
                            onChangeText={(text) => {
                                setWebsite(text);
                                if (errors.website) setErrors({...errors, website: ''});
                            }}
                            placeholder="Enter website name"
                            className={`bg-white border ${errors.website ? 'border-red-300' : 'border-gray-200'} rounded-xl pl-12 pr-4 py-4 text-base shadow-sm`}
                            style={{elevation: 1}}
                        />
                    </View>
                    {errors.website ? <Text className="text-red-500 text-sm mt-1 ml-2">{errors.website}</Text> : null}
                </View>

                {/* Username Field */}
                <View className="mb-6">
                    <Text className="text-lg font-semibold text-gray-900 mb-3">Username</Text>
                    <View className="relative">
                        <Ionicons 
                            name="person-outline" 
                            size={20} 
                            color="#9CA3AF" 
                            style={{position: 'absolute', left: 16, top: 16, zIndex: 1}} 
                        />
                        <TextInput
                            value={username}
                            onChangeText={(text) => {
                                setUsername(text);
                                if (errors.username) setErrors({...errors, username: ''});
                            }}
                            placeholder="Enter username or email"
                            className={`bg-white border ${errors.username ? 'border-red-300' : 'border-gray-200'} rounded-xl pl-12 pr-4 py-4 text-base shadow-sm`}
                            style={{elevation: 1}}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>
                    {errors.username ? <Text className="text-red-500 text-sm mt-1 ml-2">{errors.username}</Text> : null}
                </View>

                {/* Password Field */}
                <View className="mb-6">
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-lg font-semibold text-gray-900">Password</Text>
                        <TouchableOpacity
                            onPress={generatePassword}
                            className="bg-green-100 px-3 py-2 rounded-lg"
                            activeOpacity={0.7}
                        >
                            <View className="flex-row items-center">
                                <Ionicons name="refresh-outline" size={16} color="#059669" style={{marginRight: 4}} />
                                <Text className="text-green-700 font-medium text-sm">Generate</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
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
                            placeholder="Enter password"
                            secureTextEntry={!showPassword}
                            className={`bg-white border ${errors.password ? 'border-red-300' : 'border-gray-200'} rounded-xl pl-12 pr-12 py-4 text-base shadow-sm`}
                            style={{elevation: 1}}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={{position: 'absolute', right: 16, top: 16}}
                            activeOpacity={0.7}
                        >
                            <Ionicons 
                                name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                                size={20} 
                                color="#9CA3AF" 
                            />
                        </TouchableOpacity>
                    </View>
                    {errors.password ? <Text className="text-red-500 text-sm mt-1 ml-2">{errors.password}</Text> : null}
                </View>

                {/* Action Buttons */}
                <View className="mt-8 mb-6">
                    <TouchableOpacity
                        onPress={handleSave}
                        className="bg-blue-500 py-4 rounded-xl mb-4 shadow-sm"
                        style={{elevation: 2}}
                        activeOpacity={0.8}
                    >
                        <View className="flex-row items-center justify-center">
                            <Ionicons name="checkmark-circle-outline" size={20} color="white" style={{marginRight: 8}} />
                            <Text className="text-white text-center text-lg font-semibold">Update Password</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="bg-gray-100 py-4 rounded-xl"
                        activeOpacity={0.7}
                    >
                        <View className="flex-row items-center justify-center">
                            <Ionicons name="close-circle-outline" size={20} color="#6B7280" style={{marginRight: 8}} />
                            <Text className="text-gray-700 text-center text-lg font-semibold">Cancel</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

export default EditPassword;
