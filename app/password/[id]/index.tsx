import { usePasswordContext } from '@/contexts/PasswordContexts';
import React from 'react';
import { Text, View } from 'react-native';

const PasswordDetails = () => {
    const { selectedPassword } = usePasswordContext();

    if (!selectedPassword) {
        return (
            <View className="flex-1 pt-4">
                <Text className="text-lg text-center">No password selected</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 pt-4">
            <Text className="text-lg font-bold text-center">{selectedPassword.website}</Text>
            <View className="mb-4">
                <Text className="text-lg font-semibold mb-2">Username</Text>
                <Text
                    className="border border-gray-300 rounded-lg p-3 text-base"
                >{selectedPassword.username}</Text>
            </View>

            <View className="mb-6">
                <Text className="text-lg font-semibold mb-2">Password</Text>
                <Text
                    className="border border-gray-300 rounded-lg p-3 text-base"
                >{selectedPassword.password}</Text>
            </View>
        </View>
    );
}

export default PasswordDetails;
