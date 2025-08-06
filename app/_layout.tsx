import { PasswordProvider } from "@/contexts/PasswordContexts";
import { AuthProvider } from "@/contexts/AuthContext";
import { Stack } from "expo-router";
import { View } from "react-native";

import DeleteButtonHeader from "@/components/DeleteButtonHeader";
import EditButtonHeader from "@/components/EditButtonHeader";
import AuthGuard from "@/components/AuthGuard";
import './globals.css';

const RootLayout = () => {
  return (
    <AuthProvider>
      <PasswordProvider>
        <AuthGuard>
          <Stack>
            <Stack.Screen name="index" options={{ title: "Home" }} />
            <Stack.Screen
              name="add"
              options={{
                title: "Add Password",
              }}
            />
            <Stack.Screen name="password/[id]/index" options={{
              title: "",
              headerRight: () => {
                return (
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <EditButtonHeader />
                    <DeleteButtonHeader />
                  </View>
                )
              }
            }} />
            <Stack.Screen name="password/[id]/edit" options={{ title: "Edit Password" }} />
            <Stack.Screen name="settings" options={{ title: "Settings" }} />
            <Stack.Screen 
              name="login" 
              options={{ 
                headerShown: false,
                gestureEnabled: false 
              }} 
            />
            <Stack.Screen 
              name="setup-master-password" 
              options={{ 
                headerShown: false,
                gestureEnabled: false 
              }} 
            />
          </Stack>
        </AuthGuard>
      </PasswordProvider>
    </AuthProvider>
  );
};

export default RootLayout;