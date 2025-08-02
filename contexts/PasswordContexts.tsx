import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

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
}

const dummyPassword: Password[] = [
    { id: 1, website: "Item 1", username: "user1", password: "pass1" },
    { id: 2, website: "Item 2", username: "user2", password: "pass2" },
    { id: 3, website: "Item 3", username: "user3", password: "pass3" },
    { id: 4, website: "Item 4", username: "user4", password: "pass4" },
]

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

    useEffect(() => {
        // get passwords from database
        setPasswords(dummyPassword)
    }, [])

    const addPassword = (passwordData: Omit<Password, 'id'>) => {
        const newId = passwords.length > 0 ? Math.max(...passwords.map(p => p.id)) + 1 : 1;
        const newPassword: Password = {
            id: newId,
            ...passwordData
        }
        setPasswords((prevPasswords) => [...prevPasswords, newPassword])
    };

    const updatePassword = (id: number, updatedPasswordData: Partial<Omit<Password, 'id'>>) => {
        setPasswords((prevPasswords) =>
            prevPasswords.map(password =>
                password.id === id
                    ? { ...password, ...updatedPasswordData }
                    : password
            )
        );
    };

    const deletePassword = (id: number) => {
        setPasswords((prevPasswords) =>
            prevPasswords.filter(password => password.id !== id)
        );
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
        }}>
            {children}
        </PasswordContexts.Provider>
    )
}
