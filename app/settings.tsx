import React, { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import PasswordToggle from '@/components/PasswordToggle';
import FormSection from '@/components/ui/FormSection';
import InputField from '@/components/ui/InputField';
import LoadingButton from '@/components/ui/LoadingButton';
import { useFormValidation, commonValidationRules } from '@/hooks/useFormValidation';

const Settings = () => {
    const { 
        changeMasterPassword, 
        logout, 
        biometricCapabilities, 
        isBiometricEnabled, 
        enableBiometric, 
        disableBiometric,
        isAppLockEnabled,
        appLockTimeout,
        enableAppLock,
        disableAppLock,
        updateAppLockTimeout
    } = useAuth();
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
    const [biometricLoading, setBiometricLoading] = useState(false);
    const [appLockLoading, setAppLockLoading] = useState(false);

    // Form validation hook
    const { errors, validateForm, clearError, setErrors } = useFormValidation({
        currentPassword: commonValidationRules.required,
        newPassword: commonValidationRules.strongPassword,
        confirmNewPassword: { required: true, match: 'newPassword' }
    });

    const timeoutOptions = [
        { label: '1 minute', value: 1 },
        { label: '5 minutes', value: 5 },
        { label: '15 minutes', value: 15 },
        { label: '30 minutes', value: 30 }
    ];


    const handleChangePassword = async () => {
        const formValues = {
            currentPassword,
            newPassword,
            confirmNewPassword
        };

        if (!validateForm(formValues)) {
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
                setErrors({ currentPassword: 'Current password is incorrect' });
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to change password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleBiometricToggle = async () => {
        setBiometricLoading(true);
        try {
            if (isBiometricEnabled) {
                const success = await disableBiometric();
                if (!success) {
                    Alert.alert('Error', 'Failed to disable biometric authentication');
                }
            } else {
                const success = await enableBiometric();
                if (!success) {
                    Alert.alert(
                        'Error', 
                        'Failed to enable biometric authentication. Please ensure biometric authentication is set up on your device.'
                    );
                }
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred while toggling biometric authentication');
        } finally {
            setBiometricLoading(false);
        }
    };

    const handleAppLockToggle = async () => {
        setAppLockLoading(true);
        try {
            if (isAppLockEnabled) {
                const success = await disableAppLock();
                if (!success) {
                    Alert.alert('Error', 'Failed to disable app lock');
                }
            } else {
                const success = await enableAppLock(appLockTimeout);
                if (!success) {
                    Alert.alert('Error', 'Failed to enable app lock');
                }
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred while toggling app lock');
        } finally {
            setAppLockLoading(false);
        }
    };

    const handleTimeoutChange = async (newTimeout: number) => {
        try {
            if (isAppLockEnabled) {
                const success = await updateAppLockTimeout(newTimeout);
                if (!success) {
                    Alert.alert('Error', 'Failed to update timeout setting');
                }
            } else {
                // If app lock is not enabled, just update the default timeout
                await updateAppLockTimeout(newTimeout);
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred while updating timeout');
        }
    };

    return (
        <ScrollView className="flex-1 bg-gray-50" keyboardShouldPersistTaps="handled">
            {/* Header */}
            <View className="bg-white pt-12 pb-6 px-6 shadow-sm">
                <Text className="text-3xl font-bold text-gray-900 mb-2">Settings</Text>
                <Text className="text-gray-600 text-base">Manage your account security</Text>
            </View>

            <View className="px-4 pt-6">
                <FormSection title="Change Master Password" icon="key">
                    <InputField
                        label="Current Password"
                        value={currentPassword}
                        onChangeText={(text: string) => {
                            setCurrentPassword(text);
                            clearError('currentPassword');
                        }}
                        placeholder="Enter current master password"
                        secureTextEntry={!showPasswords.current}
                        error={errors.currentPassword}
                        rightElement={
                            <PasswordToggle
                                isVisible={showPasswords.current}
                                onToggle={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                                size={20}
                                color="#9CA3AF"
                                iconVariant="outline"
                            />
                        }
                        className="mb-4"
                    />

                    <InputField
                        label="New Password"
                        value={newPassword}
                        onChangeText={(text: string) => {
                            setNewPassword(text);
                            clearError('newPassword');
                        }}
                        placeholder="Enter new master password"
                        secureTextEntry={!showPasswords.new}
                        error={errors.newPassword}
                        rightElement={
                            <PasswordToggle
                                isVisible={showPasswords.new}
                                onToggle={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                                size={20}
                                color="#9CA3AF"
                                iconVariant="outline"
                            />
                        }
                        className="mb-4"
                    />

                    <InputField
                        label="Confirm New Password"
                        value={confirmNewPassword}
                        onChangeText={(text: string) => {
                            setConfirmNewPassword(text);
                            clearError('confirmNewPassword');
                        }}
                        placeholder="Confirm new master password"
                        secureTextEntry={!showPasswords.confirm}
                        error={errors.confirmNewPassword}
                        rightElement={
                            <PasswordToggle
                                isVisible={showPasswords.confirm}
                                onToggle={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                                size={20}
                                color="#9CA3AF"
                                iconVariant="outline"
                            />
                        }
                        className="mb-6"
                    />

                    <LoadingButton
                        title="Change Password"
                        icon="checkmark-circle-outline"
                        loading={loading}
                        loadingText="Changing..."
                        onPress={handleChangePassword}
                        disabled={!currentPassword || !newPassword || !confirmNewPassword}
                        variant="primary"
                    />
                </FormSection>

                {biometricCapabilities?.hasHardware && (
                    <FormSection 
                        title={`${biometricCapabilities?.primaryType} Authentication`}
                        icon={biometricCapabilities?.icon === 'face-recognition' ? 'scan' : 'finger-print'}
                        subtitle={
                            biometricCapabilities?.isAvailable 
                                ? `Use ${biometricCapabilities?.primaryType} to quickly unlock SecureVault without entering your master password.`
                                : biometricCapabilities?.isEnrolled 
                                    ? 'Biometric authentication is available but not properly configured.'
                                    : `Please set up ${biometricCapabilities?.primaryType} in your device settings to enable this feature.`
                        }
                    >

                        <TouchableOpacity
                            onPress={handleBiometricToggle}
                            disabled={!biometricCapabilities?.isAvailable || biometricLoading}
                            className={`flex-row items-center justify-between py-4 px-4 rounded-lg ${
                                biometricCapabilities?.isAvailable ? 'bg-gray-50' : 'bg-gray-100'
                            }`}
                            activeOpacity={0.7}
                        >
                            <View className="flex-row items-center flex-1">
                                <Text className={`font-medium text-base ${
                                    biometricCapabilities?.isAvailable ? 'text-gray-900' : 'text-gray-500'
                                }`}>
                                    Enable {biometricCapabilities?.primaryType}
                                </Text>
                            </View>
                            
                            {biometricLoading ? (
                                <Ionicons name="reload-outline" size={20} color="#3B82F6" />
                            ) : (
                                <View className={`w-12 h-6 rounded-full ${
                                    isBiometricEnabled ? 'bg-green-500' : 'bg-gray-300'
                                } flex-row items-center ${
                                    isBiometricEnabled ? 'justify-end' : 'justify-start'
                                } px-1`}>
                                    <View className="w-4 h-4 bg-white rounded-full shadow-sm" />
                                </View>
                            )}
                        </TouchableOpacity>

                        {!biometricCapabilities?.isAvailable && (
                            <View className="mt-3 flex-row items-start">
                                <Ionicons name="information-circle-outline" size={16} color="#F59E0B" style={{marginRight: 6, marginTop: 2}} />
                                <Text className="text-amber-600 text-sm flex-1">
                                    {!biometricCapabilities?.isEnrolled 
                                        ? `Set up ${biometricCapabilities?.primaryType} in your device settings first`
                                        : 'Biometric authentication needs to be properly configured'
                                    }
                                </Text>
                            </View>
                        )}
                    </FormSection>
                )}

                <FormSection 
                    title="App Lock" 
                    icon="timer-outline"
                    subtitle="Automatically lock the app after a period of inactivity or when it goes to the background for enhanced security."
                >

                    {/* App Lock Toggle */}
                    <TouchableOpacity
                        onPress={handleAppLockToggle}
                        disabled={appLockLoading}
                        className="flex-row items-center justify-between py-4 px-4 rounded-lg bg-gray-50 mb-4"
                        activeOpacity={0.7}
                    >
                        <View className="flex-row items-center flex-1">
                            <Text className="font-medium text-base text-gray-900">
                                Enable App Lock
                            </Text>
                        </View>
                        
                        {appLockLoading ? (
                            <Ionicons name="reload-outline" size={20} color="#3B82F6" />
                        ) : (
                            <View className={`w-12 h-6 rounded-full ${
                                isAppLockEnabled ? 'bg-green-500' : 'bg-gray-300'
                            } flex-row items-center ${
                                isAppLockEnabled ? 'justify-end' : 'justify-start'
                            } px-1`}>
                                <View className="w-4 h-4 bg-white rounded-full shadow-sm" />
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Timeout Options */}
                    {isAppLockEnabled && (
                        <View>
                            <Text className="text-base font-semibold text-gray-900 mb-3">Auto-lock timeout</Text>
                            {timeoutOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    onPress={() => handleTimeoutChange(option.value)}
                                    className="flex-row items-center justify-between py-3 px-4 rounded-lg mb-2"
                                    style={{backgroundColor: appLockTimeout === option.value ? '#EBF8FF' : '#F9FAFB'}}
                                    activeOpacity={0.7}
                                >
                                    <Text className={`font-medium ${
                                        appLockTimeout === option.value ? 'text-blue-600' : 'text-gray-900'
                                    }`}>
                                        {option.label}
                                    </Text>
                                    {appLockTimeout === option.value && (
                                        <Ionicons name="checkmark" size={20} color="#3B82F6" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {isAppLockEnabled && (
                        <View className="mt-4 flex-row items-start">
                            <Ionicons name="information-circle-outline" size={16} color="#3B82F6" style={{marginRight: 6, marginTop: 2}} />
                            <Text className="text-blue-600 text-sm flex-1">
                                The app will automatically lock when it goes to the background or after {appLockTimeout} minute{appLockTimeout !== 1 ? 's' : ''} of inactivity.
                            </Text>
                        </View>
                    )}
                </FormSection>

                <FormSection title="Account" icon="settings">
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
                </FormSection>
            </View>
        </ScrollView>
    );
};

export default Settings;