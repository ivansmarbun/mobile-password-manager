import React from 'react';
import { TouchableOpacity, Text, View, TouchableOpacityProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ActionButtonProps extends TouchableOpacityProps {
    title: string;
    icon?: keyof typeof Ionicons.glyphMap;
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
    loading?: boolean;
    loadingText?: string;
    iconSize?: number;
    fullWidth?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
    title,
    icon,
    variant = 'primary',
    loading = false,
    loadingText = 'Loading...',
    iconSize = 20,
    fullWidth = true,
    disabled,
    className,
    style,
    children,
    ...touchableProps
}) => {
    const getVariantStyles = () => {
        switch (variant) {
            case 'primary':
                return 'bg-blue-500';
            case 'secondary':
                return 'bg-gray-100';
            case 'danger':
                return 'bg-red-500';
            case 'success':
                return 'bg-green-500';
            case 'warning':
                return 'bg-amber-500';
            default:
                return 'bg-blue-500';
        }
    };

    const getTextColor = () => {
        switch (variant) {
            case 'secondary':
                return 'text-gray-700';
            default:
                return 'text-white';
        }
    };

    const getIconColor = () => {
        switch (variant) {
            case 'secondary':
                return '#6B7280';
            default:
                return 'white';
        }
    };

    const isDisabled = disabled || loading;

    return (
        <TouchableOpacity
            disabled={isDisabled}
            className={`${getVariantStyles()} py-4 rounded-xl shadow-sm ${fullWidth ? 'w-full' : ''} ${isDisabled ? 'opacity-50' : ''} ${className || ''}`}
            style={[{elevation: 2}, style]}
            activeOpacity={0.8}
            {...touchableProps}
        >
            <View className="flex-row items-center justify-center">
                {loading ? (
                    <>
                        <Ionicons name="reload-outline" size={iconSize} color={getIconColor()} style={{marginRight: 8}} />
                        <Text className={`${getTextColor()} text-center text-lg font-semibold`}>{loadingText}</Text>
                    </>
                ) : (
                    <>
                        {icon && <Ionicons name={icon} size={iconSize} color={getIconColor()} style={{marginRight: 8}} />}
                        <Text className={`${getTextColor()} text-center text-lg font-semibold`}>{title}</Text>
                    </>
                )}
            </View>
        </TouchableOpacity>
    );
};

export default ActionButton;