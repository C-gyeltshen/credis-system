import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from "react-native-paper";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#6200ee",
    primaryContainer: "#e1bee7",
    secondary: "#03dac6",
    surface: "#ffffff",
    background: "#f5f5f5",
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#bb86fc",
    primaryContainer: "#3700b3",
    secondary: "#03dac6",
    surface: "#121212",
    background: "#000000",
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const paperTheme = colorScheme === "dark" ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <StatusBar style="auto" />
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen
            name="customer-dashboard/index"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="modal"
            options={{
              presentation: "modal",
              headerShown: false,
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen
            name="credit-modal"
            options={{
              presentation: "modal",
              headerShown: false,
              animation: "slide_from_bottom",
            }}
          />
        </Stack>
      </ThemeProvider>
    </PaperProvider>
  );
}
