import React from 'react';
import { Text, TextInput, View, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputFieldProps extends TextInputProps {
    label: string;
    error?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    rightElement?: React.ReactNode;
}

const InputField: React.FC<InputFieldProps> = ({
    label,
    error,
    icon,
    rightElement,
    className,
    style,
    ...textInputProps
}) => {
    return (
        <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">{label}</Text>
            <View className="relative">
                {icon && (
                    <Ionicons 
                        name={icon} 
                        size={20} 
                        color="#9CA3AF" 
                        style={{position: 'absolute', left: 16, top: 16, zIndex: 1}} 
                    />
                )}
                <TextInput
                    className={`bg-white border ${error ? 'border-red-300' : 'border-gray-200'} rounded-xl ${icon ? 'pl-12' : 'pl-4'} ${rightElement ? 'pr-12' : 'pr-4'} py-4 text-base shadow-sm ${className || ''}`}
                    style={[{elevation: 1}, style]}
                    {...textInputProps}
                />
                {rightElement}
            </View>
            {error && <Text className="text-red-500 text-sm mt-1 ml-2">{error}</Text>}
        </View>
    );
};

export default InputField;