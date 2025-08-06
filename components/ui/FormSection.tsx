import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FormSectionProps {
    title: string;
    subtitle?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    children: React.ReactNode;
    className?: string;
}

const FormSection: React.FC<FormSectionProps> = ({
    title,
    subtitle,
    icon,
    children,
    className
}) => {
    return (
        <View className={`bg-white rounded-xl p-6 mb-6 shadow-sm ${className || ''}`} style={{elevation: 2}}>
            <View className="flex-row items-center mb-4">
                {icon && (
                    <Ionicons name={icon} size={24} color="#3B82F6" style={{marginRight: 12}} />
                )}
                <View className="flex-1">
                    <Text className="text-xl font-bold text-gray-900">{title}</Text>
                    {subtitle && <Text className="text-gray-600 text-base mt-1">{subtitle}</Text>}
                </View>
            </View>
            {children}
        </View>
    );
};

export default FormSection;