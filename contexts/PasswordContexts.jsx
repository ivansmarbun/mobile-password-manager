import { createContext, useContext, useEffect, useState } from 'react';

const dummyPassword = [
    { id: 1, website: "Item 1", username: "user1", password: "pass1" },
    { id: 2, website: "Item 2", username: "user2", password: "pass2" },
    { id: 3, website: "Item 3", username: "user3", password: "pass3" },
    { id: 4, website: "Item 4", username: "user4", password: "pass4" },
]

const PasswordContexts = createContext()
export const usePasswordContext = () => useContext(PasswordContexts)
export const PasswordProvider = ({ children }) => {
    const [passwords, setPasswords] = useState([]);
    const [selectedPassword, setSelectedPassword] = useState({});

    useEffect(() => {
        // get passwords from database
        setPasswords(dummyPassword)
    }, [])

    const addPassword = (passwordData) => {
        const newId = passwords.length > 0 ? Math.max(...passwords.map(p => p.id)) + 1 : 1;
        const newPassword = {
            id: newId,
            ...passwordData
        }
        setPasswords((prevPasswords) => [...prevPasswords, newPassword])
    };

    const updatePassword = (id, updatedPasswordData) => {
        setPasswords((prevPasswords) =>
            prevPasswords.map(password =>
                password.id === id
                    ? { ...password, ...updatedPasswordData }
                    : password
            )
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
        }}>
            {children}
        </PasswordContexts.Provider>
    )
}
