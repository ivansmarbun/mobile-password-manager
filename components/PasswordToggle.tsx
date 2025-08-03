import React from 'react';
import { TouchableOpacity, TouchableWithoutFeedback, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PasswordToggleProps {
    isVisible: boolean;
    onToggle: () => void;
    style?: any;
    size?: number;
    color?: string;
    iconVariant?: 'outline' | 'solid';
}

export default function PasswordToggle({ 
    isVisible, 
    onToggle, 
    style, 
    size = 24, 
    color = "#9CA3AF",
    iconVariant = 'solid'
}: PasswordToggleProps) {
    const getIconName = () => {
        if (iconVariant === 'outline') {
            return isVisible ? 'eye-off-outline' : 'eye-outline';
        }
        return isVisible ? 'eye-off' : 'eye';
    };

    const handlePress = () => {
        // Call onToggle directly without event manipulation
        onToggle();
    };

    return (
        <Pressable 
            onPress={handlePress}
            style={[{
                position: 'absolute',
                // Position the larger tappable area to cover the right side of the input
                right: 0,
                top: 0,
                // Much larger tappable area - 44x44 minimum for accessibility
                width: 56,
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                // Ensure this stays above other elements
                zIndex: 10,
                // Visual debugging (uncomment to see tappable area)
                // backgroundColor: 'rgba(255, 0, 0, 0.1)'
            }, style]}
            hitSlop={4}
            pressRetentionOffset={4}
            android_disableSound={true}
        >
            <Ionicons 
                name={getIconName() as any}
                size={size} 
                color={color} 
            />
        </Pressable>
    );
}