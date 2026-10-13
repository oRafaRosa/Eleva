import "react-native-gesture-handler";
import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { CormorantGaramond_600SemiBold } from "@expo-google-fonts/cormorant-garamond/600SemiBold";
import { SourceSans3_400Regular } from "@expo-google-fonts/source-sans-3/400Regular";
import { SourceSans3_600SemiBold } from "@expo-google-fonts/source-sans-3/600SemiBold";
import { ElevaProvider } from "../src/state/AppProvider";
import { colors } from "../src/theme";

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    CormorantGaramond_600SemiBold,
    SourceSans3_400Regular,
    SourceSans3_600SemiBold,
  });
  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.burgundy} />
        <Text style={styles.loadingText}>Abrindo a ELEVA…</Text>
      </View>
    );
  }
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <SafeAreaView edges={["top", "left", "right"]} style={styles.root}>
          <ElevaProvider>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.ivory },
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="login" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="content/[id]" />
              <Stack.Screen name="event/[id]" />
              <Stack.Screen name="admin" />
            </Stack>
          </ElevaProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ivory },
  loading: {
    flex: 1,
    backgroundColor: colors.ivory,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: { color: colors.burgundy, fontSize: 17 },
});
