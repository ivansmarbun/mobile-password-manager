import { PasswordProvider } from "@/contexts/PasswordContexts";
import { Stack } from "expo-router";
import { Text } from "react-native";
import './globals.css';

export default function RootLayout() {
  return (
    <PasswordProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: "Home" }} />
        <Stack.Screen name="password/[id]" options={{
           title: "",
           headerRight: () => (
            <Text
              className="mx-auto text-blue-500"
              onPress={() => {
                // Add any action you want to perform when the header right text is pressed
                console.log("Header right text pressed");
              }}
            >
              Edit
            </Text>
           )
          }} />
      </Stack>
    </PasswordProvider>
  )
}
