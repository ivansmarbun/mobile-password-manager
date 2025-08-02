import { PasswordProvider } from "@/contexts/PasswordContexts";
import { Stack } from "expo-router";

import DeleteButtonHeader from "@/components/DeleteButtonHeader";
import EditButtonHeader from "@/components/EditButtonHeader";
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
    headerRight: () => {
      return (
        <>
          <DeleteButtonHeader />
          <EditButtonHeader />
        </>
      )
    }
  }} />
        <Stack.Screen name="password/[id]/edit" options={{ title: "Edit Password" }} />
      </Stack>
    </PasswordProvider>
  )
}