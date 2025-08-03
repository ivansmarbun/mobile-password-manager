import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { BiometricAuth, BiometricCapabilities, BiometricAuthResult } from '@/utils/BiometricAuth';

interface AuthContextType {
    isAuthenticated: boolean;
    hasSetupMasterPassword: boolean;
    setupMasterPassword: (password: string) => Promise<boolean>;
    login: (password: string) => Promise<boolean>;
    logout: () => void;
    changeMasterPassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
    loading: boolean;
    // Biometric authentication
    biometricCapabilities: BiometricCapabilities | null;
    isBiometricEnabled: boolean;
    enableBiometric: () => Promise<boolean>;
    disableBiometric: () => Promise<boolean>;
    authenticateWithBiometric: () => Promise<BiometricAuthResult>;
    // App lock functionality
    isAppLockEnabled: boolean;
    appLockTimeout: number; // in minutes
    enableAppLock: (timeoutMinutes: number) => Promise<boolean>;
    disableAppLock: () => Promise<boolean>;
    updateAppLockTimeout: (timeoutMinutes: number) => Promise<boolean>;
    lockApp: () => void;
    isManualLogout: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

const MASTER_PASSWORD_KEY = 'master_password_hash';
const SALT_KEY = 'password_salt';
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const APP_LOCK_ENABLED_KEY = 'app_lock_enabled';
const APP_LOCK_TIMEOUT_KEY = 'app_lock_timeout';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [hasSetupMasterPassword, setHasSetupMasterPassword] = useState(false);
    const [loading, setLoading] = useState(true);
    const [biometricCapabilities, setBiometricCapabilities] = useState<BiometricCapabilities | null>(null);
    const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
    const [isAppLockEnabled, setIsAppLockEnabled] = useState(false);
    const [appLockTimeout, setAppLockTimeout] = useState(15); // Default to 15 minutes
    const [isManualLogout, setIsManualLogout] = useState(false);

    // Generate a random salt for password hashing using expo-crypto
    const generateSalt = async (): Promise<string> => {
        // Generate 32 random bytes and convert to hex string
        const randomBytes = await Crypto.getRandomBytesAsync(32);
        return Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
    };

    // Hash password with salt using SHA-256
    const hashPassword = async (password: string, salt: string): Promise<string> => {
        const hashBuffer = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            password + salt
        );
        return hashBuffer;
    };

    // Check if master password is already set up and initialize biometric state
    const checkMasterPasswordSetup = async (): Promise<void> => {
        try {
            const existingHash = await SecureStore.getItemAsync(MASTER_PASSWORD_KEY);
            setHasSetupMasterPassword(!!existingHash);
            
            // Initialize biometric capabilities and settings
            const capabilities = await BiometricAuth.getCapabilities();
            setBiometricCapabilities(capabilities);
            
            const biometricEnabledStr = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
            const biometricEnabled = biometricEnabledStr === 'true' && capabilities.isAvailable;
            setIsBiometricEnabled(biometricEnabled);
            
            // Initialize app lock settings
            const appLockEnabledStr = await SecureStore.getItemAsync(APP_LOCK_ENABLED_KEY);
            const appLockEnabled = appLockEnabledStr === 'true';
            setIsAppLockEnabled(appLockEnabled);
            
            const appLockTimeoutStr = await SecureStore.getItemAsync(APP_LOCK_TIMEOUT_KEY);
            const timeout = appLockTimeoutStr ? parseInt(appLockTimeoutStr, 10) : 15;
            setAppLockTimeout(timeout);
        } catch (error) {
            console.error('Error checking master password setup:', error);
            setHasSetupMasterPassword(false);
        } finally {
            setLoading(false);
        }
    };

    // Set up master password (first time setup)
    const setupMasterPassword = async (password: string): Promise<boolean> => {
        try {
            // Validate password strength
            if (password.length < 8) {
                throw new Error('Master password must be at least 8 characters long');
            }

            // Generate salt and hash password
            const salt = await generateSalt();
            const hashedPassword = await hashPassword(password, salt);

            // Store hashed password and salt
            await SecureStore.setItemAsync(MASTER_PASSWORD_KEY, hashedPassword);
            await SecureStore.setItemAsync(SALT_KEY, salt);

            setHasSetupMasterPassword(true);
            setIsAuthenticated(true);
            return true;
        } catch (error) {
            console.error('Error setting up master password:', error);
            return false;
        }
    };

    // Login with master password
    const login = async (password: string): Promise<boolean> => {
        try {
            const storedHash = await SecureStore.getItemAsync(MASTER_PASSWORD_KEY);
            const salt = await SecureStore.getItemAsync(SALT_KEY);

            if (!storedHash || !salt) {
                throw new Error('Master password not found');
            }

            const inputHash = await hashPassword(password, salt);

            if (inputHash === storedHash) {
                setIsManualLogout(false); // Reset manual logout flag on successful login
                setIsAuthenticated(true);
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error('Error during login:', error);
            return false;
        }
    };

    // Logout
    const logout = (): void => {
        setIsManualLogout(true);
        setIsAuthenticated(false);
    };

    // Change master password
    const changeMasterPassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
        try {
            // First verify current password
            const isCurrentPasswordValid = await login(currentPassword);
            if (!isCurrentPasswordValid) {
                return false;
            }

            // Validate new password strength
            if (newPassword.length < 8) {
                throw new Error('New master password must be at least 8 characters long');
            }

            // Generate new salt and hash new password
            const newSalt = await generateSalt();
            const newHashedPassword = await hashPassword(newPassword, newSalt);

            // Store new hashed password and salt
            await SecureStore.setItemAsync(MASTER_PASSWORD_KEY, newHashedPassword);
            await SecureStore.setItemAsync(SALT_KEY, newSalt);

            return true;
        } catch (error) {
            console.error('Error changing master password:', error);
            return false;
        }
    };

    // Enable biometric authentication
    const enableBiometric = async (): Promise<boolean> => {
        try {
            const canEnable = await BiometricAuth.canEnableBiometrics();
            if (!canEnable.canEnable) {
                console.error('Cannot enable biometrics:', canEnable.reason);
                return false;
            }

            // Test biometric authentication before enabling
            const result = await BiometricAuth.authenticate('Confirm biometric authentication to enable this feature');
            if (result.success) {
                await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
                setIsBiometricEnabled(true);
                return true;
            } else {
                console.error('Biometric authentication failed:', result.error);
                return false;
            }
        } catch (error) {
            console.error('Error enabling biometric authentication:', error);
            return false;
        }
    };

    // Disable biometric authentication
    const disableBiometric = async (): Promise<boolean> => {
        try {
            await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
            setIsBiometricEnabled(false);
            return true;
        } catch (error) {
            console.error('Error disabling biometric authentication:', error);
            return false;
        }
    };

    // Authenticate with biometrics
    const authenticateWithBiometric = async (): Promise<BiometricAuthResult> => {
        try {
            if (!isBiometricEnabled || !biometricCapabilities?.isAvailable) {
                return {
                    success: false,
                    error: 'Biometric authentication is not enabled or available',
                    errorType: 'not_available'
                };
            }

            const result = await BiometricAuth.authenticate();
            if (result.success) {
                setIsAuthenticated(true);
            }
            return result;
        } catch (error) {
            console.error('Error during biometric authentication:', error);
            return {
                success: false,
                error: 'An error occurred during biometric authentication',
                errorType: 'unknown'
            };
        }
    };

    // Enable app lock with timeout
    const enableAppLock = async (timeoutMinutes: number): Promise<boolean> => {
        try {
            await SecureStore.setItemAsync(APP_LOCK_ENABLED_KEY, 'true');
            await SecureStore.setItemAsync(APP_LOCK_TIMEOUT_KEY, timeoutMinutes.toString());
            setIsAppLockEnabled(true);
            setAppLockTimeout(timeoutMinutes);
            return true;
        } catch (error) {
            console.error('Error enabling app lock:', error);
            return false;
        }
    };

    // Disable app lock
    const disableAppLock = async (): Promise<boolean> => {
        try {
            await SecureStore.deleteItemAsync(APP_LOCK_ENABLED_KEY);
            setIsAppLockEnabled(false);
            return true;
        } catch (error) {
            console.error('Error disabling app lock:', error);
            return false;
        }
    };

    // Update app lock timeout
    const updateAppLockTimeout = async (timeoutMinutes: number): Promise<boolean> => {
        try {
            await SecureStore.setItemAsync(APP_LOCK_TIMEOUT_KEY, timeoutMinutes.toString());
            setAppLockTimeout(timeoutMinutes);
            return true;
        } catch (error) {
            console.error('Error updating app lock timeout:', error);
            return false;
        }
    };

    // Lock the app (logout but keep settings)
    const lockApp = (): void => {
        setIsManualLogout(false); // This is automatic lock, not manual logout
        setIsAuthenticated(false);
    };

    useEffect(() => {
        checkMasterPasswordSetup();
    }, []);

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            hasSetupMasterPassword,
            setupMasterPassword,
            login,
            logout,
            changeMasterPassword,
            loading,
            biometricCapabilities,
            isBiometricEnabled,
            enableBiometric,
            disableBiometric,
            authenticateWithBiometric,
            isAppLockEnabled,
            appLockTimeout,
            enableAppLock,
            disableAppLock,
            updateAppLockTimeout,
            lockApp,
            isManualLogout
        }}>
            {children}
        </AuthContext.Provider>
    );
};