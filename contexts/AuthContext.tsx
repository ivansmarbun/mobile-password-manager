import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

interface AuthContextType {
    isAuthenticated: boolean;
    hasSetupMasterPassword: boolean;
    setupMasterPassword: (password: string) => Promise<boolean>;
    login: (password: string) => Promise<boolean>;
    logout: () => void;
    changeMasterPassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
    loading: boolean;
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [hasSetupMasterPassword, setHasSetupMasterPassword] = useState(false);
    const [loading, setLoading] = useState(true);

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

    // Check if master password is already set up
    const checkMasterPasswordSetup = async (): Promise<void> => {
        try {
            const existingHash = await SecureStore.getItemAsync(MASTER_PASSWORD_KEY);
            setHasSetupMasterPassword(!!existingHash);
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
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};