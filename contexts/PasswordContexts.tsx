import * as SecureStore from 'expo-secure-store';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface Password {
    id: number;
    website: string;
    username: string;
    password: string;
}

interface PasswordContextType {
    passwords: Password[];
    setPasswords: React.Dispatch<React.SetStateAction<Password[]>>;
    selectedPassword: Password | null;
    setSelectedPassword: React.Dispatch<React.SetStateAction<Password | null>>;
    addPassword: (passwordData: Omit<Password, 'id'>) => void;
    updatePassword: (id: number, updatedPasswordData: Partial<Omit<Password, 'id'>>) => void;
    deletePassword: (id: number) => void;
    loading: boolean;
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
        }}>
            {children}
        </PasswordContexts.Provider>
    )
}
