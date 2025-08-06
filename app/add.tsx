import { usePasswordContext } from '@/contexts/PasswordContexts';
import { useRouter } from 'expo-router';
import React, { useState, useRef } from 'react';
import { Alert, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PasswordToggle from '@/components/PasswordToggle';
import InputField from '@/components/ui/InputField';
import ActionButton from '@/components/ui/ActionButton';
import { useFormValidation, commonValidationRules } from '@/hooks/useFormValidation';
import { useKeyboardHandler } from '@/hooks/useKeyboardHandler';
import { usePasswordGenerator } from '@/hooks/usePasswordGenerator';


const AddPassword = () => {
    const router = useRouter();
    const { addPassword } = usePasswordContext();
    const scrollViewRef = useRef<ScrollView>(null);

    // Form state
    const [website, setWebsite] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Custom hooks
    const { errors, validateForm, clearError } = useFormValidation({
        website: commonValidationRules.required,
        username: commonValidationRules.required,
        password: commonValidationRules.password
    });

    const { getContentContainerStyle, scrollToEnd } = useKeyboardHandler({
        scrollViewRef,
        scrollToEndOnFocus: true
    });

    const { generatePassword: generatePasswordAsync, isGenerating } = usePasswordGenerator();



    const handleSave = async () => {
        const formValues = { website, username, password };
        
        if (!validateForm(formValues)) {
            return;
        }

        setIsLoading(true);
        try {
            await addPassword({
                website: website.trim(),
                username: username.trim(),
                password: password.trim()
            });

            // Clear form and navigate back
            setWebsite('');
            setUsername('');
            setPassword('');
            router.back();
        } catch (error) {
            Alert.alert('Error', 'Failed to save password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGeneratePassword = async () => {
        try {
            const generatedPassword = await generatePasswordAsync();
            setPassword(generatedPassword);
            setShowPassword(true);
            clearError('password');
        } catch (error) {
            Alert.alert('Error', 'Failed to generate password. Please try again.');
        }
    };

    return (
        <View className="flex-1">
            <ScrollView 
                ref={scrollViewRef}
                className="flex-1 bg-gray-50" 
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={getContentContainerStyle()}
                showsVerticalScrollIndicator={false}
                automaticallyAdjustKeyboardInsets={true}
            >
            {/* Header */}
            <View className="bg-white pt-12 pb-6 px-6 shadow-sm">
                <Text className="text-3xl font-bold text-gray-900 mb-2">Add Password</Text>
                <Text className="text-gray-600 text-base">Create a new secure entry</Text>
            </View>

            <View className="px-4 pt-6">
                <InputField
                    label="Website"
                    value={website}
                    onChangeText={(text) => {
                        setWebsite(text);
                        clearError('website');
                    }}
                    placeholder="Enter website name"
                    icon="globe-outline"
                    error={errors.website}
                />

                <InputField
                    label="Username"
                    value={username}
                    onChangeText={(text) => {
                        setUsername(text);
                        clearError('username');
                    }}
                    placeholder="Enter username or email"
                    icon="person-outline"
                    error={errors.username}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <View className="mb-6">
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-lg font-semibold text-gray-900">Password</Text>
                        <TouchableOpacity
                            onPress={handleGeneratePassword}
                            disabled={isGenerating}
                            className="bg-green-100 px-3 py-2 rounded-lg"
                            activeOpacity={0.7}
                        >
                            <View className="flex-row items-center">
                                <Ionicons 
                                    name={isGenerating ? "reload-outline" : "refresh-outline"} 
                                    size={16} 
                                    color="#059669" 
                                    style={{marginRight: 4}} 
                                />
                                <Text className="text-green-700 font-medium text-sm">
                                    {isGenerating ? 'Generating...' : 'Generate'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    
                    <InputField
                        label=""
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            clearError('password');
                        }}
                        placeholder="Enter password"
                        icon="key-outline"
                        error={errors.password}
                        secureTextEntry={!showPassword}
                        onFocus={scrollToEnd}
                        rightElement={
                            <PasswordToggle
                                isVisible={showPassword}
                                onToggle={() => setShowPassword(!showPassword)}
                                size={20}
                                color="#9CA3AF"
                                iconVariant="outline"
                            />
                        }
                        className="mb-0"
                    />
                </View>

                <View className="mt-8 mb-20">
                    <ActionButton
                        title="Save Password"
                        icon="checkmark-circle-outline"
                        onPress={handleSave}
                        loading={isLoading}
                        loadingText="Saving..."
                        variant="primary"
                        className="mb-4"
                    />

                    <ActionButton
                        title="Cancel"
                        icon="close-circle-outline"
                        onPress={() => router.back()}
                        variant="secondary"
                    />
                </View>
            </View>
            </ScrollView>
        </View>
    );
};

export default AddPassword;
