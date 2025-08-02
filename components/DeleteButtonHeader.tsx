import { usePasswordContext } from '@/contexts/PasswordContexts';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

const DeleteButtonHeader = () => {
    const { selectedPassword, deletePassword } = usePasswordContext()
    const [modalVisible, setModalVisible] = useState(false);

    const handleDelete = () => {
        deletePassword(selectedPassword.id);
        setModalVisible(false);
        router.back();
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
                    <View className="bg-white p-6 rounded-lg mx-4 w-80">
                        <Text className="text-lg font-bold mb-4 text-center">
                            Delete Password
                        </Text>
                        <Text className="text-center mb-6">
                            Are you sure you want to delete "{selectedPassword.website}"?
                        </Text>

                        <View className="flex-row justify-between">
                            <Pressable
                                onPress={() => setModalVisible(false)}
                                className="bg-gray-500 px-4 py-2 rounded flex-1 mr-2"
                            >
                                <Text className="text-white text-center font-semibold">Cancel</Text>
                            </Pressable>

                            <Pressable
                                onPress={handleDelete}
                                className="bg-red-500 px-4 py-2 rounded flex-1 ml-2"
                            >
                                <Text className="text-white text-center font-semibold">Delete</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal >
            <Text
                className="mx-auto text-red-500"
                onPress={() => {
                    setModalVisible(true)
                }}
            >
                Delete
            </Text>
        </>
    );;
}

export default DeleteButtonHeader;
