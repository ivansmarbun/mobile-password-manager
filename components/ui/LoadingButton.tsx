import React from 'react';
import { TouchableOpacity, Text, View, TouchableOpacityProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LoadingButtonProps extends TouchableOpacityProps {
    title: string;
    loading?: boolean;
    loadingText?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    loadingIcon?: keyof typeof Ionicons.glyphMap;
    variant?: 'primary' | 'secondary' | 'danger';
    iconSize?: number;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
    title,
    loading = false,
    loadingText,
    icon,
    loadingIcon = 'reload-outline',
    variant = 'primary',
    iconSize = 20,
    disabled,
    className,
    style,
    ...touchableProps
}) => {
    const getVariantStyles = () => {
        if (loading || disabled) {
            return 'bg-gray-300';
        }
        
        switch (variant) {
            case 'primary':
                return 'bg-blue-500';
            case 'secondary':
                return 'bg-gray-100';
            case 'danger':
                return 'bg-red-500';
            default:
                return 'bg-blue-500';
        }
    };

    const getTextColor = () => {
        if (loading || disabled) {
            return 'text-gray-500';
        }
        
        switch (variant) {
            case 'secondary':
                return 'text-gray-700';
            default:
                return 'text-white';
        }
    };

    const getIconColor = () => {
        if (loading || disabled) {
            return '#9CA3AF';
        }
        
        switch (variant) {
            case 'secondary':
                return '#6B7280';
            default:
                return 'white';
        }
    };

    const isDisabled = disabled || loading;
    const displayText = loading && loadingText ? loadingText : title;
    const displayIcon = loading ? loadingIcon : icon;

    return (
        <TouchableOpacity
            disabled={isDisabled}
            className={`${getVariantStyles()} py-3 rounded-lg ${className || ''}`}
            style={style}
            activeOpacity={0.8}
            {...touchableProps}
        >
            <View className="flex-row items-center justify-center">
                {displayIcon && (
                    <Ionicons 
                        name={displayIcon} 
                        size={iconSize} 
                        color={getIconColor()} 
                        style={{marginRight: 8}} 
                    />
                )}
                <Text className={`${getTextColor()} font-semibold`}>{displayText}</Text>
            </View>
        </TouchableOpacity>
    );
};

export default LoadingButton;