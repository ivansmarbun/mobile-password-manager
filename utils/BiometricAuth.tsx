import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

export interface BiometricCapabilities {
    isAvailable: boolean;
    hasHardware: boolean;
    isEnrolled: boolean;
    supportedTypes: LocalAuthentication.AuthenticationType[];
    primaryType: string;
    icon: string;
}

export interface BiometricAuthResult {
    success: boolean;
    error?: string;
    errorType?: 'user_cancel' | 'system_cancel' | 'lockout' | 'not_available' | 'not_enrolled' | 'unknown';
}

class BiometricAuthManager {
    
    async getCapabilities(): Promise<BiometricCapabilities> {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
            
            const isAvailable = hasHardware && isEnrolled && supportedTypes.length > 0;
            
            // Determine primary biometric type and icon
            let primaryType = 'Biometric';
            let icon = 'finger-print';
            
            if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
                primaryType = Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition';
                icon = 'face-recognition';
            } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
                primaryType = Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
                icon = 'finger-print';
            } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
                primaryType = 'Iris Recognition';
                icon = 'eye';
            }
            
            return {
                isAvailable,
                hasHardware,
                isEnrolled,
                supportedTypes,
                primaryType,
                icon
            };
        } catch (error) {
            console.error('Error checking biometric capabilities:', error);
            return {
                isAvailable: false,
                hasHardware: false,
                isEnrolled: false,
                supportedTypes: [],
                primaryType: 'Biometric',
                icon: 'finger-print'
            };
        }
    }
    
    async authenticate(promptMessage?: string): Promise<BiometricAuthResult> {
        try {
            const capabilities = await this.getCapabilities();
            
            if (!capabilities.isAvailable) {
                return {
                    success: false,
                    error: 'Biometric authentication is not available',
                    errorType: 'not_available'
                };
            }
            
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: promptMessage || `Use ${capabilities.primaryType} to unlock SecureVault`,
                fallbackLabel: 'Use Master Password',
                cancelLabel: 'Cancel',
                disableDeviceFallback: true, // We handle fallback manually
            });
            
            if (result.success) {
                return { success: true };
            } else {
                // Handle different error scenarios
                let errorType: BiometricAuthResult['errorType'] = 'unknown';
                let errorMessage = 'Biometric authentication failed';
                
                if (result.error === 'user_cancel' || result.error === 'app_cancel') {
                    errorType = 'user_cancel';
                    errorMessage = 'Authentication cancelled by user';
                } else if (result.error === 'system_cancel') {
                    errorType = 'system_cancel';
                    errorMessage = 'Authentication cancelled by system';
                } else if (result.error === 'lockout') {
                    errorType = 'lockout';
                    errorMessage = 'Too many failed attempts. Please use master password.';
                } else if (result.error === 'not_available') {
                    errorType = 'not_available';
                    errorMessage = 'Biometric authentication not available';
                } else if (result.error === 'not_enrolled') {
                    errorType = 'not_enrolled';
                    errorMessage = 'No biometric credentials enrolled';
                }
                
                return {
                    success: false,
                    error: errorMessage,
                    errorType
                };
            }
        } catch (error) {
            console.error('Biometric authentication error:', error);
            return {
                success: false,
                error: 'An unexpected error occurred during biometric authentication',
                errorType: 'unknown'
            };
        }
    }
    
    async canEnableBiometrics(): Promise<{ canEnable: boolean; reason?: string }> {
        try {
            const capabilities = await this.getCapabilities();
            
            if (!capabilities.hasHardware) {
                return {
                    canEnable: false,
                    reason: 'This device does not support biometric authentication'
                };
            }
            
            if (!capabilities.isEnrolled) {
                return {
                    canEnable: false,
                    reason: 'No biometric credentials are enrolled on this device. Please set up biometric authentication in your device settings first.'
                };
            }
            
            return { canEnable: true };
        } catch (error) {
            console.error('Error checking if biometrics can be enabled:', error);
            return {
                canEnable: false,
                reason: 'Unable to check biometric capabilities'
            };
        }
    }
}

export const BiometricAuth = new BiometricAuthManager();