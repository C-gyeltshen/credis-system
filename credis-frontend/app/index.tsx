import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image } from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import { router } from "expo-router";
import { useAuth } from "@/hooks/useAuth";

export default function SplashScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return; // Wait for auth check

    // Show splash screen for 2 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
      
      // Redirect based on auth status
      if (isAuthenticated) {
        router.replace("/customer-dashboard");
      } else {
        router.replace("/login");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>CREDIS</Text>
        <Text style={styles.subtitle}>Credit for Shopkeepers</Text>
      </View>

      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF8C00" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1565C0",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 80,
  },
  logo: {
    width: 400,
    height: 400,
    borderRadius: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FF8C00",
    marginTop: 16,
    marginBottom: 8,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 18,
    color: "#E6F4FE",
    textAlign: "center",
    fontWeight: "500",
  },
  loadingContainer: {
    alignItems: "center",
    position: "absolute",
    bottom: 80,
  },
  loadingText: {
    color: "#E6F4FE",
    marginTop: 16,
    fontSize: 16,
  },
});
