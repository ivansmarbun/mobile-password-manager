import { usePasswordContext } from '@/contexts/PasswordContexts';
import { router } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';

const EditButtonHeader = () => {
    const { selectedPassword } = usePasswordContext()
    return (
        <Text
            className="mx-auto text-blue-500"
            onPress={() => {
                router.push(`/password/${selectedPassword.id}/edit`)
            }}
        >
            Edit
        </Text>
    );;
}

export default EditButtonHeader;
