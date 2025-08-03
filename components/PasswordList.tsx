import { usePasswordContext } from '@/contexts/PasswordContexts';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';


const PasswordList = () => {
    const router = useRouter();
    const { setSelectedPassword, loading, searchQuery, setSearchQuery, filteredPasswords, exportPasswords, importPasswords } = usePasswordContext();

    const handleExport = async () => {
        try {
            await exportPasswords();
            Alert.alert('Success', 'Passwords exported successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to export passwords. Please try again.');
        }
    };

    const handleImport = async () => {
        Alert.alert(
            'Import Passwords',
            'This will add passwords from a backup file to your existing passwords. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Import',
                    onPress: async () => {
                        try {
                            await importPasswords();
                            Alert.alert('Success', 'Passwords imported successfully!');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to import passwords. Please check the file format.');
                        }
                    }
                }
            ]
        );
    };

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
            
            {/* Export/Import Buttons */}
            <View className="flex-row justify-between mb-4">
                <TouchableOpacity
                    onPress={handleExport}
                    className="bg-green-500 px-4 py-2 rounded-lg flex-1 mr-2"
                >
                    <Text className="text-white font-semibold text-center">Export Backup</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleImport}
                    className="bg-orange-500 px-4 py-2 rounded-lg flex-1 ml-2"
                >
                    <Text className="text-white font-semibold text-center">Import Backup</Text>
                </TouchableOpacity>
            </View>

            <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search passwords..."
                className="border border-gray-300 rounded-lg px-4 py-3 mb-4 bg-white"
            />

            {filteredPasswords.length === 0 && searchQuery.trim() === '' && (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-gray-500 text-lg">No passwords saved</Text>
                    <Text className="text-gray-400 text-sm mt-2">
                        Tap the + button to add your first password
                    </Text>
                </View>
            )}

            {filteredPasswords.length === 0 && searchQuery.trim() !== '' && (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-gray-500 text-lg">No passwords found</Text>
                    <Text className="text-gray-400 text-sm mt-2">
                        Try searching for a different website or username
                    </Text>
                </View>
            )}

            {filteredPasswords.length > 0 && (
                <FlatList
                    data={filteredPasswords}
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
            )}
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
