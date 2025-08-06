import { usePasswordContext } from '@/contexts/PasswordContexts';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { ActivityIndicator, Alert, SectionList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


const PasswordList = React.memo(function PasswordList() {
    const router = useRouter();
    const { logout } = useAuth();
    const { setSelectedPassword, loading, searchQuery, setSearchQuery, filteredPasswords, sortedAndGroupedPasswords, exportPasswords, importPasswords } = usePasswordContext();

    const handleLogout = useCallback(() => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout? You will need to enter your master password again.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: logout }
            ]
        );
    }, [logout]);

    const handleExport = useCallback(async () => {
        try {
            await exportPasswords();
            Alert.alert('Success', 'Passwords exported successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to export passwords. Please try again.');
        }
    }, [exportPasswords]);

    const handleImport = useCallback(async () => {
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
    }, [importPasswords]);

    if (loading) {
        return (
            <View className='flex-1 pt-12 px-4 justify-center items-center'>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="mt-4 text-gray-600">Loading passwords...</Text>
            </View>
        );

    }
    return (
        <View className='flex-1 bg-gray-50'>
            {/* Header */}
            <View className="bg-white pt-12 pb-6 px-6 shadow-sm">
                <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-1">
                        <Text className="text-3xl font-bold text-gray-900 mb-1">SecureVault</Text>
                        <Text className="text-gray-600 text-base">Your passwords, secured</Text>
                    </View>
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => router.push('/settings')}
                            className="bg-gray-100 p-3 rounded-full mr-3"
                            activeOpacity={0.7}
                        >
                            <Ionicons name="settings-outline" size={24} color="#6B7280" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleLogout}
                            className="bg-gray-100 p-3 rounded-full"
                            activeOpacity={0.7}
                        >
                            <Ionicons name="log-out-outline" size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            
            <View className="flex-1 px-4">
                {/* Action Buttons */}
                <View className="flex-row justify-between mb-6 mt-4">
                    <TouchableOpacity
                        onPress={handleExport}
                        className="bg-emerald-500 px-6 py-3 rounded-xl flex-1 mr-3 shadow-sm"
                        style={{elevation: 2}}
                    >
                        <View className="flex-row items-center justify-center">
                            <Ionicons name="cloud-upload-outline" size={18} color="white" style={{marginRight: 8}} />
                            <Text className="text-white font-semibold">Export</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleImport}
                        className="bg-amber-500 px-6 py-3 rounded-xl flex-1 ml-3 shadow-sm"
                        style={{elevation: 2}}
                    >
                        <View className="flex-row items-center justify-center">
                            <Ionicons name="cloud-download-outline" size={18} color="white" style={{marginRight: 8}} />
                            <Text className="text-white font-semibold">Import</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View className="relative mb-6">
                    <Ionicons 
                        name="search" 
                        size={20} 
                        color="#9CA3AF" 
                        style={{position: 'absolute', left: 16, top: 14, zIndex: 1}} 
                    />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search passwords..."
                        className="bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-4 text-base shadow-sm"
                        style={{elevation: 1}}
                    />
                </View>

                {filteredPasswords.length === 0 && searchQuery.trim() === '' && (
                    <View className="flex-1 justify-center items-center">
                        <Ionicons name="lock-closed-outline" size={64} color="#D1D5DB" />
                        <Text className="text-gray-500 text-xl font-medium mt-4">No passwords saved</Text>
                        <Text className="text-gray-400 text-base mt-2 text-center px-8">
                            Tap the + button to add your first password
                        </Text>
                    </View>
                )}

                {filteredPasswords.length === 0 && searchQuery.trim() !== '' && (
                    <View className="flex-1 justify-center items-center">
                        <Ionicons name="search" size={64} color="#D1D5DB" />
                        <Text className="text-gray-500 text-xl font-medium mt-4">No passwords found</Text>
                        <Text className="text-gray-400 text-base mt-2 text-center px-8">
                            Try searching for a different website or username
                        </Text>
                    </View>
                )}

                {filteredPasswords.length > 0 && (
                    <SectionList
                        sections={sortedAndGroupedPasswords}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => {
                                    setSelectedPassword(item);
                                    router.push(`/password/${item.id}/`)
                                }}
                                className="mb-3"
                                activeOpacity={0.7}
                            >
                                <View className="bg-white rounded-xl p-4 shadow-sm" style={{elevation: 2}}>
                                    <View className="flex-row items-center">
                                        <View className="bg-blue-100 w-12 h-12 rounded-full items-center justify-center mr-4">
                                            <Ionicons name="globe-outline" size={24} color="#3B82F6" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-lg font-semibold text-gray-900 mb-1">{item.website}</Text>
                                            <Text className="text-gray-600 text-base">{item.username}</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )}
                        renderSectionHeader={({ section: { title } }) => (
                            <View className="bg-gray-100 px-4 py-2 mb-2 mt-4 rounded-lg">
                                <Text className="text-gray-700 font-bold text-lg">{title}</Text>
                            </View>
                        )}
                        keyExtractor={item => item.id.toString()}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{paddingBottom: 100}}
                        stickySectionHeadersEnabled={false}
                    />
                )}
            </View>
            
            {/* Floating Action Button */}
            <TouchableOpacity
                onPress={() => router.push('/add')}
                className="absolute bottom-8 right-6 bg-blue-500 w-16 h-16 rounded-full items-center justify-center shadow-lg"
                style={{elevation: 8}}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={28} color="white" />
            </TouchableOpacity>
        </View>
    );
});

export default PasswordList;
