import React, { useState } from "react";
import { Link } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 16,
      backgroundColor: "#f0f5ff",
    },
    card: {
      backgroundColor: "#fff",
      borderRadius: 16,
      padding: 32,
      width: "100%",
      maxWidth: 400,
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      flexDirection: "column",
      gap: 20,
    },
    input: {
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#ccc",
      fontSize: 16,
      width: "100%",
      marginBottom: 8,
    },
    button: {
      padding: 12,
      borderRadius: 8,
      backgroundColor: "#7c3aed",
      alignItems: "center",
      marginTop: 8,
    },
    buttonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 16,
    },
    link: {
      color: "#7c3aed",
      textDecorationLine: "underline",
      textAlign: "center",
      marginTop: 16,
    },
    error: {
      color: "#e53e3e",
      fontSize: 14,
      textAlign: "center",
    },
    success: {
      color: "#38a169",
      fontSize: 14,
      textAlign: "center",
    },
    title: {
      textAlign: "center",
      marginBottom: 8,
      fontSize: 22,
      fontWeight: "bold",
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    // TODO: Integrate with backend API
    setTimeout(() => {
      setLoading(false);
      if (email.includes("@")) {
        setSuccess("If this email exists, a reset link has been sent.");
      } else {
        setError("Please enter a valid email address.");
      }
    }, 1200);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Forgot Password</Text>
        <TextInput
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit as any}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Send Reset Link</Text>
          )}
        </TouchableOpacity>
        {error && <Text style={styles.error}>{error}</Text>}
        {success && <Text style={styles.success}>{success}</Text>}
        <Link href="/login" asChild>
          <Text style={styles.link}>Back to Login</Text>
        </Link>
      </View>
    </View>
  );
};

export default ForgotPassword;
