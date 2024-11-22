import { ThemeProvider } from "@styling/theme";
import { Stack } from "expo-router";
import React from "react";

function Content() {
  return (
    <Stack>
      {/* <Stack.Screen name='index' options={{ headerShown: false, title: 'Home' }} />
      <Stack.Screen
        name='newCounter'
        options={{
          title: 'New counter',
          ...headerStyle,
          ...modalStyle,
        }}
      />
      <Stack.Screen
        name='settings'
        options={{ title: 'Settings', ...headerStyle, ...modalStyle }}
      /> */}
    </Stack>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Content />
    </ThemeProvider>
  );
}
