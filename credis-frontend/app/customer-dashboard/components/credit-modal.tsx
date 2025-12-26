import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
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
import { router, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

type TransactionType = "credit_given" | "payment_received";

export default function CreditTransactionModal() {
  const params = useLocalSearchParams();
  const customerId = params.customerId as string;
  const customerName = params.customerName as string;
  const initialType = (params.type as TransactionType) || "credit_given";

  // Transaction details
  const [transactionType, setTransactionType] =
    useState<TransactionType>(initialType);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [itemsDescription, setItemsDescription] = useState("");
  const [journalNumber, setJournalNumber] = useState("");
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Validation & loading
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!amount.trim()) {
      newErrors.amount = "Amount is required";
    } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = "Amount must be a positive number";
    }

    if (transactionType === "payment_received" && !journalNumber.trim()) {
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

      // Prepare payload as per backend API
      const payload = {
        customer_id: customerId,
        store_id: "29740cc6-2406-414e-a168-ad0fb61f473e",
        amount: Number(amount),
        transaction_type: transactionType,
        items_description: itemsDescription.trim() || undefined,
        journal_number: journalNumber.trim() || undefined,
        created_by_owner_id: params.ownerId as string | undefined, // optional, if available
      };

      const response = await fetch("http://localhost:8080/api/credits", {
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

      // Show success message and redirect
      Alert.alert(
        "Success",
        transactionType === "credit_given"
          ? "Credit issued successfully"
          : "Payment recorded successfully",
        [
          {
            text: "OK",
            onPress: () => router.replace("/customer-dashboard"),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create transaction");
    } finally {
      setLoading(false);
    }
  };

  const transactionTypeConfig = {
    credit_given: {
      color: "#1976d2",
      backgroundColor: "#e3f2fd",
      icon: "trending-up",
      title: "Credit Given",
      description: "Issue credit to customer",
    },
    payment_received: {
      color: "#4caf50",
      backgroundColor: "#e8f5e9",
      icon: "payments",
      title: "Payment Received",
      description: "Record customer payment",
    },
  };

  const currentConfig = transactionTypeConfig[transactionType];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: currentConfig.color }]}>
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
          <Text style={styles.headerTitle}>Add Transaction</Text>
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

          {/* Transaction Type Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="swap-horiz"
                size={20}
                color={currentConfig.color}
              />
              <Text style={styles.sectionTitle}>Transaction Type</Text>
            </View>

            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeCard,
                  transactionType === "credit_given" && styles.typeCardActive,
                  transactionType === "credit_given" && {
                    borderColor: transactionTypeConfig.credit_given.color,
                    backgroundColor:
                      transactionTypeConfig.credit_given.backgroundColor,
                  },
                ]}
                onPress={() => setTransactionType("credit_given")}
                activeOpacity={0.7}
              >
                <View style={styles.typeCardContent}>
                  <View
                    style={[
                      styles.circleCheckbox,
                      transactionType === "credit_given" &&
                        styles.circleCheckboxSelected,
                      { borderColor: transactionTypeConfig.credit_given.color },
                      transactionType === "credit_given" && {
                        backgroundColor:
                          transactionTypeConfig.credit_given.color,
                      },
                    ]}
                  >
                    {transactionType === "credit_given" && (
                      <MaterialIcons name="check" size={16} color="#fff" />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.typeTitle,
                        transactionType === "credit_given" &&
                          styles.typeTitleActive,
                      ]}
                    >
                      Credit Given
                    </Text>
                    <Text style={styles.typeDescription}>
                      Issue credit to customer
                    </Text>
                  </View>
                  <MaterialIcons
                    name="trending-up"
                    size={24}
                    color={transactionTypeConfig.credit_given.color}
                  />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeCard,
                  transactionType === "payment_received" &&
                    styles.typeCardActive,
                  transactionType === "payment_received" && {
                    borderColor: transactionTypeConfig.payment_received.color,
                    backgroundColor:
                      transactionTypeConfig.payment_received.backgroundColor,
                  },
                ]}
                onPress={() => setTransactionType("payment_received")}
                activeOpacity={0.7}
              >
                <View style={styles.typeCardContent}>
                  <View
                    style={[
                      styles.circleCheckbox,
                      transactionType === "payment_received" &&
                        styles.circleCheckboxSelected,
                      {
                        borderColor:
                          transactionTypeConfig.payment_received.color,
                      },
                      transactionType === "payment_received" && {
                        backgroundColor:
                          transactionTypeConfig.payment_received.color,
                      },
                    ]}
                  >
                    {transactionType === "payment_received" && (
                      <MaterialIcons name="check" size={16} color="#fff" />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.typeTitle,
                        transactionType === "payment_received" &&
                          styles.typeTitleActive,
                      ]}
                    >
                      Payment Received
                    </Text>
                    <Text style={styles.typeDescription}>
                      Record customer payment
                    </Text>
                  </View>
                  <MaterialIcons
                    name="payments"
                    size={24}
                    color={transactionTypeConfig.payment_received.color}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Transaction Details Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="receipt"
                size={20}
                color={currentConfig.color}
              />
              <Text style={styles.sectionTitle}>Transaction Details</Text>
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
              theme={{ colors: { primary: currentConfig.color } }}
            />
            {errors.amount && (
              <HelperText type="error" visible={!!errors.amount}>
                {errors.amount}
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
              placeholder="Brief description of the transaction"
              left={<TextInput.Icon icon="text" />}
              theme={{ colors: { primary: currentConfig.color } }}
            />
          </View>

          {/* Reference Information Section */}
          {transactionType === "payment_received" && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons
                  name="article"
                  size={20}
                  color={currentConfig.color}
                />
                <Text style={styles.sectionTitle}>Reference Information</Text>
              </View>

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
                theme={{ colors: { primary: currentConfig.color } }}
              />
              {errors.journalNumber && (
                <HelperText type="error" visible={!!errors.journalNumber}>
                  {errors.journalNumber}
                </HelperText>
              )}
            </View>
          )}

          {/* Info Box */}
          <View
            style={[
              styles.infoBox,
              { backgroundColor: currentConfig.backgroundColor },
            ]}
          >
            <MaterialIcons name="info" size={20} color={currentConfig.color} />
            <Text style={[styles.infoText, { color: currentConfig.color }]}>
              {transactionType === "credit_given"
                ? "This will increase the customer's remaining credit"
                : "This will reduce the customer's remaining credit"}
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
            textColor={currentConfig.color}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
            loading={loading}
            disabled={loading}
            buttonColor={currentConfig.color}
          >
            {transactionType === "credit_given"
              ? "Issue Credit"
              : "Record Payment"}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  typeSelector: {
    gap: 12,
  },
  typeCard: {
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#fafafa",
  },
  typeCardActive: {
    borderWidth: 2,
  },
  typeCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  circleCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  circleCheckboxSelected: {
    borderWidth: 2,
  },
  typeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  typeTitleActive: {
    color: "#1a1a1a",
    fontWeight: "700",
  },
  typeDescription: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
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
});
