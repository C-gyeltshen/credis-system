import React, { useEffect } from "react";
import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { router } from "expo-router";
import { useAuth } from "../contexts/AuthContext";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function AuthGuard({
  children,
  requireAuth = true,
}: AuthGuardProps) {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !user) {
        // User needs to be authenticated but isn't, redirect to login
        router.replace("/auth/login" as any);
      } else if (!requireAuth && user) {
        // User is authenticated but trying to access auth screens, redirect to dashboard
        router.replace("/dashboard" as any);
      }
    }
  }, [user, isLoading, requireAuth]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Show content if:
  // - requireAuth is true and user is authenticated
  // - requireAuth is false and user is not authenticated
  if ((requireAuth && user) || (!requireAuth && !user)) {
    return <>{children}</>;
  }

  // Return null while redirecting
  return null;
}
