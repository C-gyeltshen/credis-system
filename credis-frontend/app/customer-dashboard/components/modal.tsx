import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  IconButton,
  HelperText,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

export default function AddCustomerModal() {
  // Customer basic info
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [creditLimit, setCreditLimit] = useState("");

  // Validation & loading
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Basic validation
    if (!name.trim()) {
      newErrors.name = "Name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (phoneNumber.replace(/\s/g, "").length !== 8) {
      newErrors.phoneNumber = "Phone number must be exactly 8 digits";
    } else if (!/^\d+$/.test(phoneNumber.replace(/\s/g, ""))) {
      newErrors.phoneNumber = "Phone number must contain only digits";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (
      creditLimit &&
      (isNaN(Number(creditLimit)) || Number(creditLimit) < 0)
    ) {
      newErrors.creditLimit = "Credit limit must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const customerData = {
        storeId: "fc8516c1-5068-4be9-8025-ed99d2890692",
        name: name.trim(),
        phone_number: phoneNumber.trim().replace(/\s/g, ""),
        email: email.trim(),
        creditLimit: creditLimit ? Number(creditLimit) : 0,
      };

      const response = await fetch("http://localhost:8080/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create customer");
      }

      const result = await response.json();

      Alert.alert("Success", "Customer created successfully!", [
        {
          text: "OK",
          onPress: () => router.replace("/customer-dashboard"),
        },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <IconButton
            icon="close"
            size={24}
            onPress={() => router.back()}
            iconColor="#fff"
          />
          <Text style={styles.headerTitle}>Add Customer</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Basic Information Section */}
          <View style={styles.section}>
            <View style={styles.inputWrapper}>
              <TextInput
                label="Full Name *"
                placeholder="Enter customer's full name"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (errors.name) {
                    setErrors({ ...errors, name: "" });
                  }
                }}
                mode="outlined"
                style={styles.input}
                error={!!errors.name}
                left={<TextInput.Icon icon="account" />}
                outlineColor="#e0e0e0"
                activeOutlineColor="#1976d2"
              />
              {errors.name && (
                <HelperText type="error" visible={!!errors.name}>
                  {errors.name}
                </HelperText>
              )}
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                label="Phone Number *"
                placeholder="8 digits (e.g., 12345678)"
                value={phoneNumber}
                onChangeText={(text) => {
                  setPhoneNumber(text);
                  if (errors.phoneNumber) {
                    setErrors({ ...errors, phoneNumber: "" });
                  }
                }}
                mode="outlined"
                style={styles.input}
                keyboardType="phone-pad"
                error={!!errors.phoneNumber}
                left={<TextInput.Icon icon="phone" />}
                outlineColor="#e0e0e0"
                activeOutlineColor="#1976d2"
              />
              {errors.phoneNumber && (
                <HelperText type="error" visible={!!errors.phoneNumber}>
                  {errors.phoneNumber}
                </HelperText>
              )}
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                label="Email *"
                placeholder="customer@example.com"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) {
                    setErrors({ ...errors, email: "" });
                  }
                }}
                mode="outlined"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                error={!!errors.email}
                left={<TextInput.Icon icon="email" />}
                outlineColor="#e0e0e0"
                activeOutlineColor="#1976d2"
              />
              {errors.email && (
                <HelperText type="error" visible={!!errors.email}>
                  {errors.email}
                </HelperText>
              )}
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                label="Credit Limit (Optional)"
                placeholder="0.00"
                value={creditLimit}
                onChangeText={(text) => {
                  setCreditLimit(text);
                  if (errors.creditLimit) {
                    setErrors({ ...errors, creditLimit: "" });
                  }
                }}
                mode="outlined"
                style={styles.input}
                keyboardType="decimal-pad"
                error={!!errors.creditLimit}
                left={<TextInput.Affix text="Nu. " />}
                outlineColor="#e0e0e0"
                activeOutlineColor="#1976d2"
              />
              {errors.creditLimit ? (
                <HelperText type="error" visible={!!errors.creditLimit}>
                  {errors.creditLimit}
                </HelperText>
              ) : (
                <HelperText type="info" visible={true}>
                  Maximum amount the customer can borrow
                </HelperText>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <Button
            mode="outlined"
            onPress={() => router.back()}
            style={styles.cancelButton}
            disabled={loading}
            textColor="#666"
            icon="close"
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.submitButton}
            loading={loading}
            disabled={loading}
            buttonColor="#1976d2"
            icon="check"
          >
            Create
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1976d2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  welcomeCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  welcomeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#e3f2fd",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
    gap: 12,
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e3f2fd",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#666",
  },
  inputWrapper: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#fff",
  },
  divider: {
    marginVertical: 8,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  switchDescription: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  credentialsSection: {
    marginTop: 8,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#e3f2fd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#1976d2",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cancelButton: {
    flex: 1,
    borderColor: "#e0e0e0",
  },
  submitButton: {
    flex: 1,
    elevation: 2,
  },
});
