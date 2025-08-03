import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

interface Password {
    id: number;
    website: string;
    username: string;
    password: string;
}

interface PasswordSection {
    title: string;
    data: Password[];
}

interface PasswordContextType {
    passwords: Password[];
    setPasswords: React.Dispatch<React.SetStateAction<Password[]>>;
    selectedPassword: Password | null;
    setSelectedPassword: React.Dispatch<React.SetStateAction<Password | null>>;
    addPassword: (passwordData: Omit<Password, 'id'>) => Promise<void>;
    updatePassword: (id: number, updatedPasswordData: Partial<Omit<Password, 'id'>>) => Promise<void>;
    deletePassword: (id: number) => Promise<void>;
    loading: boolean;
    searchQuery: string;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
    filteredPasswords: Password[];
    sortedAndGroupedPasswords: PasswordSection[];
    exportPasswords: () => Promise<void>;
    importPasswords: () => Promise<void>;
}

const PasswordContexts = createContext<PasswordContextType | undefined>(undefined)

export const usePasswordContext = () => {
    const context = useContext(PasswordContexts);
    if (context === undefined) {
        throw new Error('usePasswordContext must be used within a PasswordProvider');
    }
    return context;
}

export const PasswordProvider = ({ children }: { children: ReactNode }) => {
    const [passwords, setPasswords] = useState<Password[]>([]);
    const [selectedPassword, setSelectedPassword] = useState<Password | null>(null);
    const [loading, setLoading] = useState<boolean>(true)
    const [searchQuery, setSearchQuery] = useState<string>('');

    const getPasswordIds = async (): Promise<number[]> => {
        try {
            const idsString = await SecureStore.getItemAsync('password_ids');
            return idsString ? JSON.parse(idsString) : [];
        } catch (error) {
            console.error('Error getting password IDs:', error);
            return [];
        }
    };

    const savePasswordIds = async (ids: number[]): Promise<void> => {
        try {
            await SecureStore.setItemAsync('password_ids', JSON.stringify(ids));
        } catch (error) {
            console.error('Error saving password IDs:', error);
        }
    };

    const getNextId = async (): Promise<number> => {
        try {
            const nextIdString = await SecureStore.getItemAsync('next_password_id');
            return nextIdString ? parseInt(nextIdString, 10) : 1;
        } catch (error) {
            console.error('Error getting next ID:', error);
            return 1;
        }
    };

    const saveNextId = async (id: number): Promise<void> => {
        try {
            await SecureStore.setItemAsync('next_password_id', id.toString());
        } catch (error) {
            console.error('Error saving next ID:', error);
        }
    };

    const loadAllPasswords = async (): Promise<void> => {
        try {
            setLoading(true);
            const ids = await getPasswordIds();
            const loadedPasswords: Password[] = [];

            for (const id of ids) {
                try {
                    const passwordString = await SecureStore.getItemAsync(`password_${id}`);
                    if (passwordString) {
                        const password = JSON.parse(passwordString);
                        loadedPasswords.push(password);
                    }
                } catch (error) {
                    console.error(`Error loading password ${id}:`, error);
                }
            }

            setPasswords(loadedPasswords);
        } catch (error) {
            console.error('Error loading passwords:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAllPasswords();
    }, []);

    const addPassword = async (passwordData: Omit<Password, 'id'>): Promise<void> => {
        const newId = await getNextId();
        const newPassword: Password = {
            id: newId,
            ...passwordData
        };

        await SecureStore.setItemAsync(`password_${newId}`, JSON.stringify(newPassword));
        // Update the ids index
        const currentIds = await getPasswordIds();
        await savePasswordIds([...currentIds, newId]);

        await saveNextId(newId + 1);
        setPasswords((prevPasswords) => [...prevPasswords, newPassword]);
    };

    const updatePassword = async (id: number, updatedPasswordData: Partial<Omit<Password, 'id'>>) => {
        try {
            const currentPassword = passwords.find(p => p.id === id);
            if (!currentPassword) {
                throw new Error(`Password with id ${id} not found`);
            }

            const updatedPassword = { ...currentPassword, ...updatedPasswordData };
            await SecureStore.setItemAsync(`password_${id}`, JSON.stringify(updatedPassword));
            setPasswords((prevPassword) =>
                prevPassword.map(password => password.id === id ? updatedPassword : password)
            )
            if (selectedPassword && selectedPassword.id === id) {
                setSelectedPassword(updatedPassword);
            }
        } catch (error) {
            console.error('Error updating password:', error);
        }
    };

    const deletePassword = async (id: number): Promise<void> => {
        try {
            await SecureStore.deleteItemAsync(`password_${id}`);

            // Update the ids index
            const currentIds = await getPasswordIds();
            const updatedIds = currentIds.filter(passwordId => passwordId !== id);
            await savePasswordIds(updatedIds);

            setPasswords((prevPasswords) =>
                prevPasswords.filter(password => password.id !== id)
            );
        } catch (error) {
            console.error('Error deleting password:', error);
        }
    };

    const exportPasswords = async (): Promise<void> => {
        try {
            const exportData = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                passwords: passwords
            };

            const jsonData = JSON.stringify(exportData, null, 2);
            const fileName = `passwords_backup_${new Date().toISOString().split('T')[0]}.json`;
            const fileUri = FileSystem.documentDirectory + fileName;

            await FileSystem.writeAsStringAsync(fileUri, jsonData);

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'application/json',
                    dialogTitle: 'Save Password Backup'
                });
            } else {
                throw new Error('Sharing is not available on this device');
            }
        } catch (error) {
            console.error('Error exporting passwords:', error);
            throw error;
        }
    };

    const importPasswords = async (): Promise<void> => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true
            });

            if (result.canceled) {
                // User cancelled - don't throw error, just return silently
                return;
            }

            if (!result.assets || result.assets.length === 0) {
                throw new Error('No file selected');
            }

            const fileUri = result.assets[0].uri;
            const fileContent = await FileSystem.readAsStringAsync(fileUri);
            const importData = JSON.parse(fileContent);

            if (!importData.passwords || !Array.isArray(importData.passwords)) {
                throw new Error('Invalid backup file format');
            }

            if (importData.passwords.length === 0) {
                throw new Error('Backup file contains no passwords');
            }

            // Get the current next ID to avoid conflicts
            const nextId = await getNextId();
            let currentNextId = nextId;

            for (const passwordData of importData.passwords) {
                const newPassword = {
                    ...passwordData,
                    id: currentNextId
                };

                // Save to SecureStore
                await SecureStore.setItemAsync(`password_${currentNextId}`, JSON.stringify(newPassword));
                currentNextId++;
            }

            // Update the IDs index and next ID
            const currentIds = await getPasswordIds();
            const newIds = Array.from({ length: importData.passwords.length }, (_, i) => nextId + i);
            await savePasswordIds([...currentIds, ...newIds]);
            await saveNextId(currentNextId);

            // Reload all passwords
            await loadAllPasswords();
        } catch (error) {
            console.error('Error importing passwords:', error);
            throw error;
        }
    };

    const filteredPasswords = useMemo(() => {
        if (!searchQuery.trim()) {
            return passwords;
        }

        return passwords.filter(password =>
            password.website.toLowerCase().includes(searchQuery.toLowerCase()) ||
            password.username.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [passwords, searchQuery]);

    const sortedAndGroupedPasswords = useMemo(() => {
        // Sort passwords alphabetically by website name
        const sortedPasswords = [...filteredPasswords].sort((a, b) => 
            a.website.toLowerCase().localeCompare(b.website.toLowerCase())
        );

        // Group passwords by first letter
        const groupedMap = new Map<string, Password[]>();
        
        sortedPasswords.forEach(password => {
            const firstChar = password.website.charAt(0).toUpperCase();
            let section: string;
            
            if (/[A-Z]/.test(firstChar)) {
                section = firstChar;
            } else if (/[0-9]/.test(firstChar)) {
                section = '0-9';
            } else {
                section = '#';
            }
            
            if (!groupedMap.has(section)) {
                groupedMap.set(section, []);
            }
            groupedMap.get(section)!.push(password);
        });

        // Convert to array and sort sections
        const sections: PasswordSection[] = [];
        const sortedSectionKeys = Array.from(groupedMap.keys()).sort((a, b) => {
            // Custom sort: A-Z first, then 0-9, then #
            if (a === '0-9' && b === '#') return -1;
            if (a === '#' && b === '0-9') return 1;
            if (a === '0-9' || a === '#') return 1;
            if (b === '0-9' || b === '#') return -1;
            return a.localeCompare(b);
        });

        sortedSectionKeys.forEach(key => {
            const passwords = groupedMap.get(key)!;
            sections.push({
                title: key,
                data: passwords
            });
        });

        return sections;
    }, [filteredPasswords]);

    return (
        <PasswordContexts.Provider value={{
            passwords,
            setPasswords,
            selectedPassword,
            setSelectedPassword,
            addPassword,
            updatePassword,
            deletePassword,
            loading,
            searchQuery,
            setSearchQuery,
            filteredPasswords,
            sortedAndGroupedPasswords,
            exportPasswords,
            importPasswords
        }}>
            {children}
        </PasswordContexts.Provider>
    )
}
