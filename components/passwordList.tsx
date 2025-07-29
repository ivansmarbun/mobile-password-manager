import { usePasswordContext } from '@/contexts/PasswordContexts';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


const PasswordList = () => {
    const router = useRouter();
    const { passwords, setSelectedPassword } = usePasswordContext();

    return (
        <View className='flex-1 pt-12 px-4'>
            <Text className="text-2xl font-bold mb-4">Password List</Text>
            <FlatList
                data={passwords}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => {
                            setSelectedPassword(item);
                            router.push(`/password/${item.id}`)
                        }}
                        className="mb-4">
                        <View className="p-4 border-b border-gray-200">
                            <Text className="text-lg font-bold">{item.website}</Text>
                            <Text className="text-gray-600">{item.username}</Text>
                        </View>
                    </TouchableOpacity>
                )}
                keyExtractor={item => item.id.toString()}
            />
        </View>
    );
}

const styles = StyleSheet.create({})

export default PasswordList;
