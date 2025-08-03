import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function Settings() {
    const { changeMasterPassword, logout } = useAuth();
    const router = useRouter();
    
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const validateNewPassword = (pwd: string): string => {
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
        return '';
    };

    const handleChangePassword = async () => {
        const newPasswordError = validateNewPassword(newPassword);
        const confirmError = newPassword !== confirmNewPassword ? 'Passwords do not match' : '';

        setErrors({
            current: '',
            new: newPasswordError,
            confirm: confirmError
        });

        if (!currentPassword) {
            setErrors(prev => ({ ...prev, current: 'Current password is required' }));
            return;
        }

        if (newPasswordError || confirmError) {
            return;
        }

        setLoading(true);
        try {
            const success = await changeMasterPassword(currentPassword, newPassword);
            if (success) {
                Alert.alert(
                    'Success',
                    'Master password changed successfully!',
                    [{ text: 'OK', onPress: () => router.back() }]
                );
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
            } else {
                setErrors(prev => ({ ...prev, current: 'Current password is incorrect' }));
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to change password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white pt-12 pb-6 px-6 shadow-sm">
                <Text className="text-3xl font-bold text-gray-900 mb-2">Settings</Text>
                <Text className="text-gray-600 text-base">Manage your account security</Text>
            </View>

            <View className="px-4 pt-6">
                {/* Change Master Password Section */}
                <View className="bg-white rounded-xl p-6 mb-6 shadow-sm" style={{elevation: 2}}>
                    <View className="flex-row items-center mb-4">
                        <Ionicons name="key" size={24} color="#3B82F6" style={{marginRight: 12}} />
                        <Text className="text-xl font-bold text-gray-900">Change Master Password</Text>
                    </View>

                    {/* Current Password */}
                    <View className="mb-4">
                        <Text className="text-base font-semibold text-gray-900 mb-2">Current Password</Text>
                        <View className="relative">
                            <TextInput
                                value={currentPassword}
                                onChangeText={(text) => {
                                    setCurrentPassword(text);
                                    if (errors.current) setErrors({...errors, current: ''});
                                }}
                                placeholder="Enter current master password"
                                secureTextEntry={!showPasswords.current}
                                className={`bg-gray-50 border ${errors.current ? 'border-red-300' : 'border-gray-200'} rounded-lg pl-4 pr-12 py-3 text-base`}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                                style={{position: 'absolute', right: 12, top: 12}}
                                activeOpacity={0.7}
                            >
                                <Ionicons 
                                    name={showPasswords.current ? 'eye-off-outline' : 'eye-outline'} 
                                    size={20} 
                                    color="#9CA3AF" 
                                />
                            </TouchableOpacity>
                        </View>
                        {errors.current ? <Text className="text-red-500 text-sm mt-1">{errors.current}</Text> : null}
                    </View>

                    {/* New Password */}
                    <View className="mb-4">
                        <Text className="text-base font-semibold text-gray-900 mb-2">New Password</Text>
                        <View className="relative">
                            <TextInput
                                value={newPassword}
                                onChangeText={(text) => {
                                    setNewPassword(text);
                                    if (errors.new) setErrors({...errors, new: ''});
                                }}
                                placeholder="Enter new master password"
                                secureTextEntry={!showPasswords.new}
                                className={`bg-gray-50 border ${errors.new ? 'border-red-300' : 'border-gray-200'} rounded-lg pl-4 pr-12 py-3 text-base`}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                                style={{position: 'absolute', right: 12, top: 12}}
                                activeOpacity={0.7}
                            >
                                <Ionicons 
                                    name={showPasswords.new ? 'eye-off-outline' : 'eye-outline'} 
                                    size={20} 
                                    color="#9CA3AF" 
                                />
                            </TouchableOpacity>
                        </View>
                        {errors.new ? <Text className="text-red-500 text-sm mt-1">{errors.new}</Text> : null}
                    </View>

                    {/* Confirm New Password */}
                    <View className="mb-6">
                        <Text className="text-base font-semibold text-gray-900 mb-2">Confirm New Password</Text>
                        <View className="relative">
                            <TextInput
                                value={confirmNewPassword}
                                onChangeText={(text) => {
                                    setConfirmNewPassword(text);
                                    if (errors.confirm) setErrors({...errors, confirm: ''});
                                }}
                                placeholder="Confirm new master password"
                                secureTextEntry={!showPasswords.confirm}
                                className={`bg-gray-50 border ${errors.confirm ? 'border-red-300' : 'border-gray-200'} rounded-lg pl-4 pr-12 py-3 text-base`}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                                style={{position: 'absolute', right: 12, top: 12}}
                                activeOpacity={0.7}
                            >
                                <Ionicons 
                                    name={showPasswords.confirm ? 'eye-off-outline' : 'eye-outline'} 
                                    size={20} 
                                    color="#9CA3AF" 
                                />
                            </TouchableOpacity>
                        </View>
                        {errors.confirm ? <Text className="text-red-500 text-sm mt-1">{errors.confirm}</Text> : null}
                    </View>

                    {/* Change Password Button */}
                    <TouchableOpacity
                        onPress={handleChangePassword}
                        disabled={loading || !currentPassword || !newPassword || !confirmNewPassword}
                        className={`py-3 rounded-lg ${
                            loading || !currentPassword || !newPassword || !confirmNewPassword 
                                ? 'bg-gray-300' 
                                : 'bg-blue-500'
                        }`}
                        activeOpacity={0.8}
                    >
                        <View className="flex-row items-center justify-center">
                            {loading ? (
                                <>
                                    <Ionicons name="reload-outline" size={20} color="white" style={{marginRight: 8}} />
                                    <Text className="text-white font-semibold">Changing...</Text>
                                </>
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle-outline" size={20} color="white" style={{marginRight: 8}} />
                                    <Text className="text-white font-semibold">Change Password</Text>
                                </>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Other Settings */}
                <View className="bg-white rounded-xl p-6 mb-6 shadow-sm" style={{elevation: 2}}>
                    <View className="flex-row items-center mb-4">
                        <Ionicons name="settings" size={24} color="#3B82F6" style={{marginRight: 12}} />
                        <Text className="text-xl font-bold text-gray-900">Account</Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => {
                            Alert.alert(
                                'Logout',
                                'Are you sure you want to logout?',
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    { text: 'Logout', style: 'destructive', onPress: logout }
                                ]
                            );
                        }}
                        className="flex-row items-center py-3"
                        activeOpacity={0.7}
                    >
                        <Ionicons name="log-out-outline" size={20} color="#DC2626" style={{marginRight: 12}} />
                        <Text className="text-red-600 font-medium">Logout</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}