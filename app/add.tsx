import { usePasswordContext } from '@/contexts/PasswordContexts';
import { useRouter } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View, ScrollView, Keyboard, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';
import PasswordToggle from '@/components/PasswordToggle';

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

export default function AddPassword() {
    const router = useRouter();
    const { addPassword } = usePasswordContext(); // We'll add this function to context next
    const scrollViewRef = useRef<ScrollView>(null);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [screenHeight] = useState(Dimensions.get('window').height);

    // Form state
    const [website, setWebsite] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({ website: '', username: '', password: '' });

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
            setKeyboardHeight(e.endCoordinates.height);
        });
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardHeight(0);
        });

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

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
            // Add the password
            await addPassword({
                website: website.trim(),
                username: username.trim(),
                password: password.trim()
            });

            // Clear form and navigate back
            setWebsite('');
            setUsername('');
            setPassword('');
            setErrors({ website: '', username: '', password: '' });
            router.back();
        } catch (error) {
            Alert.alert('Error', 'Failed to save password. Please try again.');
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
        <View className="flex-1">
            <ScrollView 
                ref={scrollViewRef}
                className="flex-1 bg-gray-50" 
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ 
                    paddingBottom: keyboardHeight > 0 ? keyboardHeight + 50 : 100,
                    minHeight: screenHeight
                }}
                showsVerticalScrollIndicator={false}
                automaticallyAdjustKeyboardInsets={true}
            >
            {/* Header */}
            <View className="bg-white pt-12 pb-6 px-6 shadow-sm">
                <Text className="text-3xl font-bold text-gray-900 mb-2">Add Password</Text>
                <Text className="text-gray-600 text-base">Create a new secure entry</Text>
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
                                if (errors.website) setErrors(prev => ({...prev, website: ''}));
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
                                if (errors.username) setErrors(prev => ({...prev, username: ''}));
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
                                if (errors.password) setErrors(prev => ({...prev, password: ''}));
                            }}
                            placeholder="Enter password"
                            secureTextEntry={!showPassword}
                            className={`bg-white border ${errors.password ? 'border-red-300' : 'border-gray-200'} rounded-xl pl-12 pr-12 py-4 text-base shadow-sm`}
                            style={{elevation: 1}}
                            onFocus={() => {
                                // Scroll to the password field when focused, accounting for keyboard
                                setTimeout(() => {
                                    scrollViewRef.current?.scrollToEnd({ animated: true });
                                }, 300);
                            }}
                        />
                        <PasswordToggle
                            isVisible={showPassword}
                            onToggle={() => setShowPassword(!showPassword)}
                            size={20}
                            color="#9CA3AF"
                            iconVariant="outline"
                        />
                    </View>
                    {errors.password ? <Text className="text-red-500 text-sm mt-1 ml-2">{errors.password}</Text> : null}
                </View>

                {/* Action Buttons */}
                <View className="mt-8 mb-20">
                    <TouchableOpacity
                        onPress={handleSave}
                        className="bg-blue-500 py-4 rounded-xl mb-4 shadow-sm"
                        style={{elevation: 2}}
                        activeOpacity={0.8}
                    >
                        <View className="flex-row items-center justify-center">
                            <Ionicons name="checkmark-circle-outline" size={20} color="white" style={{marginRight: 8}} />
                            <Text className="text-white text-center text-lg font-semibold">Save Password</Text>
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
        </View>
    );
}
