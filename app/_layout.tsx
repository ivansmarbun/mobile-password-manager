import { PasswordProvider } from "@/contexts/PasswordContexts";
import { Stack } from "expo-router";
import { View } from "react-native";

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
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <EditButtonHeader />
          <DeleteButtonHeader />
        </View>
      )
    }
  }} />
        <Stack.Screen name="password/[id]/edit" options={{ title: "Edit Password" }} />
      </Stack>
    </PasswordProvider>
  )
}