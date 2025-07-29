import { usePasswordContext } from '@/contexts/PasswordContexts';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const PasswordDetails = () => {
    const { selectedPassword } = usePasswordContext();
    
    return (
        <View className="flex-1 pt-4">
            <Text className="text-lg font-bold text-center">{selectedPassword.website}</Text>
            <View className="mt-4 p-4 border-b border-gray-200">
                <Text className="text-gray-600 mt-4 text-sm">Username</Text>
                <Text className="text-black text-base">{selectedPassword.username}</Text>
                <Text className="text-gray-600 mt-4">Password</Text>
                <Text className="text-black text-base">{selectedPassword.password}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({})

export default PasswordDetails;
