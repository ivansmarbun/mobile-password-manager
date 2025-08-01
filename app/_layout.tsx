import { PasswordProvider } from "@/contexts/PasswordContexts";
import { Stack } from "expo-router";

import EditHeaderButton from "@/components/EditHeaderButton";
import './globals.css';

export default function RootLayout() {
  return (
    <PasswordProvider>
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
          headerRight: () => <EditHeaderButton />
        }} />
        <Stack.Screen name="password/[id]/edit" options={{ title: "Edit Password" }} />
      </Stack>
    </PasswordProvider>
  )
}