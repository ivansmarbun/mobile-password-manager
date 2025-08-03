import { usePasswordContext } from '@/contexts/PasswordContexts';
import { router } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EditButtonHeader = () => {
    const { selectedPassword } = usePasswordContext()
    
    if (!selectedPassword) {
        return null;
    }
    
    return (
        <TouchableOpacity
            onPress={() => {
                router.push(`/password/${selectedPassword.id}/edit`)
            }}
            className="p-2 mr-2"
            activeOpacity={0.7}
            style={{minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center'}}
        >
            <Ionicons name="pencil" size={20} color="#3B82F6" />
        </TouchableOpacity>
    );
}

export default EditButtonHeader;
