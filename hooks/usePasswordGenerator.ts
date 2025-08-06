import { useState, useCallback } from 'react';
import * as Crypto from 'expo-crypto';

interface PasswordConfig {
    length: number;
    includeLowercase: boolean;
    includeUppercase: boolean;
    includeNumbers: boolean;
    includeSymbols: boolean;
    customSymbols?: string;
}

const DEFAULT_CONFIG: PasswordConfig = {
    length: 16,
    includeLowercase: true,
    includeUppercase: true,
    includeNumbers: true,
    includeSymbols: true,
    customSymbols: '!@#$%^&*'
};

const CHARACTER_SETS = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    symbols: '!@#$%^&*'
};

export const usePasswordGenerator = (initialConfig: Partial<PasswordConfig> = {}) => {
    const [config, setConfig] = useState<PasswordConfig>({
        ...DEFAULT_CONFIG,
        ...initialConfig
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [lastGeneratedPassword, setLastGeneratedPassword] = useState<string>('');

    const getCharacterSet = useCallback((currentConfig: PasswordConfig): string => {
        let chars = '';
        
        if (currentConfig.includeLowercase) {
            chars += CHARACTER_SETS.lowercase;
        }
        if (currentConfig.includeUppercase) {
            chars += CHARACTER_SETS.uppercase;
        }
        if (currentConfig.includeNumbers) {
            chars += CHARACTER_SETS.numbers;
        }
        if (currentConfig.includeSymbols) {
            chars += currentConfig.customSymbols || CHARACTER_SETS.symbols;
        }
        
        return chars;
    }, []);

    const generatePassword = useCallback(async (customConfig?: Partial<PasswordConfig>): Promise<string> => {
        setIsGenerating(true);
        
        try {
            const finalConfig = { ...config, ...customConfig };
            const chars = getCharacterSet(finalConfig);
            
            if (!chars) {
                throw new Error('No character sets selected for password generation');
            }

            const randomBytes = await Crypto.getRandomBytesAsync(finalConfig.length);
            
            let result = '';
            for (let i = 0; i < finalConfig.length; i++) {
                result += chars.charAt(randomBytes[i] % chars.length);
            }
            
            setLastGeneratedPassword(result);
            return result;
        } catch (error) {
            console.error('Error generating password with crypto:', error);
            
            // Fallback to Math.random if crypto fails
            const finalConfig = { ...config, ...customConfig };
            const chars = getCharacterSet(finalConfig);
            
            let result = '';
            for (let i = 0; i < finalConfig.length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            
            setLastGeneratedPassword(result);
            return result;
        } finally {
            setIsGenerating(false);
        }
    }, [config, getCharacterSet]);

    const updateConfig = useCallback((newConfig: Partial<PasswordConfig>) => {
        setConfig(prev => ({ ...prev, ...newConfig }));
    }, []);

    const resetConfig = useCallback(() => {
        setConfig(DEFAULT_CONFIG);
    }, []);

    const getPasswordStrength = useCallback((password: string): { score: number; label: string; color: string } => {
        let score = 0;
        
        // Length bonus
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;
        
        // Character diversity
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^a-zA-Z0-9]/.test(password)) score += 1;
        
        // Determine strength
        if (score <= 2) return { score, label: 'Weak', color: '#DC2626' };
        if (score <= 4) return { score, label: 'Medium', color: '#F59E0B' };
        return { score, label: 'Strong', color: '#059669' };
    }, []);

    return {
        config,
        updateConfig,
        resetConfig,
        generatePassword,
        isGenerating,
        lastGeneratedPassword,
        getPasswordStrength,
        getCharacterSet
    };
};