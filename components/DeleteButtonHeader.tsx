import { usePasswordContext } from '@/contexts/PasswordContexts';
import { router } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { Modal, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DeleteButtonHeader = React.memo(function DeleteButtonHeader() {
    const { selectedPassword, deletePassword } = usePasswordContext()
    const [modalVisible, setModalVisible] = useState(false);

    const handleDelete = useCallback(() => {
        if (selectedPassword) {
            deletePassword(selectedPassword.id);
            setModalVisible(false);
            router.back();
        }
    }, [deletePassword, selectedPassword?.id]);

    if (!selectedPassword) {
        return null;
    }

    return (
        <>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(!modalVisible)}
            >
                {/* Semi-transparent background */}
                <View className="flex-1 justify-center items-center bg-black/50">
                    {/* Modal dialog */}
                    <View className="bg-white p-6 rounded-xl mx-4 w-80 shadow-lg" style={{elevation: 10}}>
                        <View className="items-center mb-4">
                            <View className="bg-red-100 w-16 h-16 rounded-full items-center justify-center mb-4">
                                <Ionicons name="warning" size={32} color="#DC2626" />
                            </View>
                            <Text className="text-xl font-bold text-gray-900 text-center">
                                Delete Password
                            </Text>
                        </View>
                        <Text className="text-center text-gray-600 mb-6 text-base">
                            Are you sure you want to permanently delete the password for <Text className="font-semibold">"{selectedPassword.website}"</Text>? This action cannot be undone.
                        </Text>

                        <View className="flex-row justify-between">
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                className="bg-gray-100 px-6 py-3 rounded-xl flex-1 mr-3"
                                activeOpacity={0.7}
                            >
                                <Text className="text-gray-700 text-center font-semibold text-base">Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleDelete}
                                className="bg-red-500 px-6 py-3 rounded-xl flex-1 ml-3"
                                activeOpacity={0.8}
                            >
                                <View className="flex-row items-center justify-center">
                                    <Ionicons name="trash" size={16} color="white" style={{marginRight: 6}} />
                                    <Text className="text-white text-center font-semibold text-base">Delete</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal >
            <TouchableOpacity
                onPress={() => {
                    setModalVisible(true)
                }}
                className="p-2"
                activeOpacity={0.7}
                style={{minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center'}}
            >
                <Ionicons name="trash" size={20} color="#DC2626" />
            </TouchableOpacity>
        </>
    );
});

export default DeleteButtonHeader;
