import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  IconButton,
  HelperText,
  Snackbar,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { MaterialIcons } from "@expo/vector-icons";
import Navigation from "@/components/Navbar";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL;

export default function PaymentReceivedModal() {
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const customerId = params.customerId as string;
  const customerName = params.customerName as string;
  const storeId = (params.storeId as string) || user?.storeId;

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [journalNumber, setJournalNumber] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  
  // Snackbar state
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState<"success" | "error">("success");

  const CONFIG = {
    color: "#4caf50",
    backgroundColor: "#e8f5e9",
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!amount.trim()) {
      newErrors.amount = "Amount is required";
    } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = "Amount must be a positive number";
    }

    if (!journalNumber.trim()) {
      newErrors.journalNumber = "Journal number is required for payments";
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

      const payload = {
        customer_id: customerId,
        store_id: storeId,
        amount: Number(amount),
        transaction_type: "payment_received",
        journal_number: journalNumber.trim(),
        created_by_owner_id: params.ownerId as string | undefined,
      };

      const response = await fetch(`${API_BASE_URL}/credits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create transaction");
      }

      // Show success snackbar
      setSnackbarType("success");
      setSnackbarMessage(`✅ Payment of Nu. ${amount} received from ${customerName || "customer"}!`);
      setSnackbarVisible(true);

      // Wait a moment for user to see the success message
      setTimeout(() => {
        router.replace("/customer-dashboard");
      }, 1500);
      
    } catch (error: any) {
      setSnackbarType("error");
      setSnackbarMessage(error.message || "Failed to create transaction");
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Navigation>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
          {/* Header */}
          <View style={[styles.header, { backgroundColor: CONFIG.color }]}>
            <IconButton
              icon="close"
              size={24}
              onPress={() => {
                if (
                  typeof router.canGoBack === "function"
                    ? router.canGoBack()
                    : false
                ) {
                  router.back();
                } else {
                  router.replace("/customer-dashboard");
                }
              }}
              iconColor="#fff"
            />
            <Text style={styles.headerTitle}>Record Payment</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Customer Info */}
            {customerName && (
              <View style={styles.customerInfo}>
                <MaterialIcons name="person" size={20} color="#666" />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.customerLabel}>Customer</Text>
                  <Text style={styles.customerName}>{customerName}</Text>
                </View>
              </View>
            )}

            {/* Transaction Type Banner */}
            <View
              style={[
                styles.typeBanner,
                { backgroundColor: CONFIG.backgroundColor },
              ]}
            >
              <MaterialIcons name="payments" size={32} color={CONFIG.color} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.typeBannerTitle, { color: CONFIG.color }]}>
                  Payment Received
                </Text>
                <Text style={styles.typeBannerSubtitle}>
                  Record customer payment
                </Text>
              </View>
            </View>

            {/* Transaction Details Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="receipt" size={20} color={CONFIG.color} />
                <Text style={styles.sectionTitle}>Payment Details</Text>
              </View>

              <TextInput
                label="Amount *"
                value={amount}
                onChangeText={(text) => {
                  setAmount(text);
                  if (errors.amount) {
                    setErrors({ ...errors, amount: "" });
                  }
                }}
                mode="outlined"
                style={styles.input}
                keyboardType="decimal-pad"
                error={!!errors.amount}
                left={<TextInput.Affix text="Nu. " />}
                theme={{ colors: { primary: CONFIG.color } }}
              />
              {errors.amount && (
                <HelperText type="error" visible={!!errors.amount}>
                  {errors.amount}
                </HelperText>
              )}

              <TextInput
                label="Journal Number *"
                value={journalNumber}
                onChangeText={(text) => {
                  setJournalNumber(text);
                  if (errors.journalNumber) {
                    setErrors({ ...errors, journalNumber: "" });
                  }
                }}
                mode="outlined"
                style={styles.input}
                error={!!errors.journalNumber}
                placeholder="e.g., JRN-2024-001"
                left={<TextInput.Icon icon="book" />}
                theme={{ colors: { primary: CONFIG.color } }}
              />
              {errors.journalNumber && (
                <HelperText type="error" visible={!!errors.journalNumber}>
                  {errors.journalNumber}
                </HelperText>
              )}

              <TextInput
                label="Description"
                value={description}
                onChangeText={setDescription}
                mode="outlined"
                style={styles.input}
                multiline
                numberOfLines={2}
                placeholder="Provide a brief description"
                left={<TextInput.Icon icon="text" />}
                theme={{ colors: { primary: CONFIG.color } }}
              />
            </View>

            {/* Info Box */}
            <View
              style={[
                styles.infoBox,
                { backgroundColor: CONFIG.backgroundColor },
              ]}
            >
              <MaterialIcons name="info" size={20} color={CONFIG.color} />
              <Text style={[styles.infoText, { color: CONFIG.color }]}>
                This will reduce the customer's outstanding balance
              </Text>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <Button
              mode="outlined"
              onPress={() => {
                if (
                  typeof router.canGoBack === "function"
                    ? router.canGoBack()
                    : false
                ) {
                  router.back();
                } else {
                  router.replace("/customer-dashboard");
                }
              }}
              style={styles.button}
              disabled={loading}
              textColor={CONFIG.color}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.button}
              loading={loading}
              disabled={loading}
              buttonColor={CONFIG.color}
            >
              Record Payment
            </Button>
          </View>

          {/* Success/Error Snackbar */}
          <Snackbar
            visible={snackbarVisible}
            onDismiss={() => setSnackbarVisible(false)}
            duration={3000}
            style={[
              styles.snackbar,
              snackbarType === "success" ? styles.snackbarSuccess : styles.snackbarError
            ]}
            action={{
              label: 'Close',
              onPress: () => setSnackbarVisible(false),
            }}
          >
            {snackbarMessage}
          </Snackbar>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Navigation>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    padding: 16,
    paddingBottom: 32,
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  customerLabel: {
    fontSize: 12,
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  customerName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginTop: 2,
  },
  typeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  typeBannerTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  typeBannerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  input: {
    marginBottom: 4,
    backgroundColor: "#fff",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  button: {
    flex: 1,
  },
  snackbar: {
    marginBottom: 20,
  },
  snackbarSuccess: {
    backgroundColor: "#4caf50",
  },
  snackbarError: {
    backgroundColor: "#f44336",
  },
});