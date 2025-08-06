import React from 'react';
import { Text, TextProps } from 'react-native';

interface ErrorTextProps extends TextProps {
    error?: string;
    visible?: boolean;
}

const ErrorText: React.FC<ErrorTextProps> = ({ 
    error, 
    visible = true, 
    className,
    style,
    ...textProps 
}) => {
    if (!error || !visible) {
        return null;
    }

    return (
        <Text 
            className={`text-red-500 text-sm mt-1 ml-2 ${className || ''}`}
            style={style}
            {...textProps}
        >
            {error}
        </Text>
    );
};

export default ErrorText;