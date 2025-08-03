import { usePasswordContext } from '@/contexts/PasswordContexts';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';


const PasswordList = () => {
    const router = useRouter();
    const { passwords, setSelectedPassword, loading } = usePasswordContext();

    if (loading) {
        return (
            <View className='flex-1 pt-12 px-4 justify-center items-center'>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="mt-4 text-gray-600">Loading passwords...</Text>
            </View>
        );

    }
    return (
        <View className='flex-1 pt-12 px-4'>
            <Text className="text-2xl font-bold mb-4">Password List</Text>
            <FlatList
                data={passwords}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => {
                            setSelectedPassword(item);
                            router.push(`/password/${item.id}/`)
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
            <TouchableOpacity
                onPress={() => router.push('/add')}
                className="absolute bottom-6 right-6 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
            >
                <Text className="text-white text-2xl font-bold">+</Text>
            </TouchableOpacity>
        </View>
    );
}

export default PasswordList;
