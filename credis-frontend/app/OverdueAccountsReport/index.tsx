import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import Navigation from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";

interface Customer {
  customerId: string;
  customerName: string;
  customerPhone: string;
  outstandingBalance: number;
  totalCreditGiven: number;
  totalPaymentsReceived: number;
}

interface ApiResponse {
  data: Customer[];
  success: boolean;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export default function HighestBalanceReport() {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { user } = useAuth();

  const STORE_ID = user?.storeId;

  useEffect(() => {
    if (STORE_ID) fetchBalances();
  }, [STORE_ID]);

  const fetchBalances = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/credits/store/${STORE_ID}/outstanding?limit=20`,
      );
      const data: ApiResponse = await response.json();
      console.log("customer data:", data);
      if (data.success) setCustomers(data.data);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch outstanding balances");
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleSMS = (customer: Customer) => {
    const message = `Dear ${customer.customerName}, this is a friendly reminder regarding your outstanding balance of Nu. ${customer.outstandingBalance.toLocaleString("en-IN")}. Please visit our store to settle the credit. Thank you!`;
    const url =
      Platform.OS === "ios"
        ? `sms:${customer.customerPhone}&body=${encodeURIComponent(message)}`
        : `sms:${customer.customerPhone}?body=${encodeURIComponent(message)}`;

    Linking.openURL(url);
  };

  const handleViewTransactions = (customer: Customer) => {
    router.push({
      pathname: "/transaction",
      params: {
        customerId: customer.customerId,
        customerName: customer.customerName,
        customerPhone: customer.customerPhone,
      },
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalBalance = customers.reduce(
    (sum, c) => sum + c.outstandingBalance,
    0,
  );

  return (
    <Navigation>
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Enhanced Header */}
          <LinearGradient
            colors={["#c62828", "#e53935", "#ef5350"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerTop}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>Remaining Credits</Text>
                <Text style={styles.headerSubtitle}>
                  Credit Management Dashboard
                </Text>
              </View>
              <View style={styles.iconContainer}>
                <MaterialIcons
                  name="account-balance-wallet"
                  size={40}
                  color="rgba(255,255,255,0.9)"
                />
              </View>
            </View>

            {/* Stats Card */}
            {customers.length > 0 && (
              <View style={styles.statsCard}>
                <View style={styles.statItem}>
                  <MaterialIcons name="people" size={20} color="#c62828" />
                  <View style={styles.statTextContainer}>
                    <Text style={styles.statValue}>{customers.length}</Text>
                    <Text style={styles.statLabel}>Customers</Text>
                  </View>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <MaterialIcons
                    name="attach-money"
                    size={20}
                    color="#c62828"
                  />
                  <View style={styles.statTextContainer}>
                    <Text style={styles.statValue}>
                      Nu. {formatCurrency(totalBalance)}
                    </Text>
                    <Text style={styles.statLabel}>Total Remaining Credit</Text>
                  </View>
                </View>
              </View>
            )}
          </LinearGradient>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#c62828" />
              <Text style={styles.loadingText}>Loading customer data...</Text>
            </View>
          ) : customers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="inbox" size={80} color="#ccc" />
              <Text style={styles.emptyTitle}>No Remaining Credits</Text>
              <Text style={styles.emptyText}>
                All customers have cleared their credits!
              </Text>
            </View>
          ) : (
            <View style={styles.tableContainer}>
              {/* Enhanced Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.columnHeader, styles.nameColumn]}>
                  CUSTOMER NAME
                </Text>
                <Text style={[styles.columnHeader, styles.balanceColumn]}>
                  REMAINING CREDIT
                </Text>
                <View style={styles.expandColumn} />
              </View>

              {/* Enhanced Table Rows */}
              {customers.map((customer, index) => (
                <View key={customer.customerId} style={styles.rowWrapper}>
                  <TouchableOpacity
                    style={[
                      styles.row,
                      expandedId === customer.customerId && styles.activeRow,
                    ]}
                    onPress={() =>
                      setExpandedId(
                        expandedId === customer.customerId
                          ? null
                          : customer.customerId,
                      )
                    }
                    activeOpacity={0.7}
                  >
                    {/* Customer Name Cell */}
                    <View style={styles.nameColumn}>
                      <View style={styles.nameCell}>
                        <View style={styles.rankBadge}>
                          <Text style={styles.rankText}>#{index + 1}</Text>
                        </View>
                        <Text
                          style={styles.cellName}
                          numberOfLines={2}
                          ellipsizeMode="tail"
                        >
                          {customer.customerName}
                        </Text>
                      </View>
                    </View>

                    {/* Balance Cell */}
                    <View style={styles.balanceColumn}>
                      <Text style={styles.cellBalance}>
                        Nu. {formatCurrency(customer.outstandingBalance)}
                      </Text>
                    </View>

                    {/* Expand Icon */}
                    <View style={styles.expandColumn}>
                      <MaterialIcons
                        name={
                          expandedId === customer.customerId
                            ? "expand-less"
                            : "expand-more"
                        }
                        size={24}
                        color="#666"
                      />
                    </View>
                  </TouchableOpacity>

                  {/* Enhanced Extended Row */}
                  {expandedId === customer.customerId && (
                    <View style={styles.expandedContent}>
                      <View style={styles.phoneContainer}>
                        <View style={styles.phoneIcon}>
                          <MaterialIcons
                            name="phone-android"
                            size={18}
                            color="#1976d2"
                          />
                        </View>
                        <View>
                          <Text style={styles.phoneLabel}>Phone Number</Text>
                          <Text style={styles.phoneText}>
                            {customer.customerPhone}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.actionContainer}>
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.callBtn]}
                          onPress={() => handleCall(customer.customerPhone)}
                          activeOpacity={0.8}
                        >
                          <MaterialIcons name="call" size={20} color="#fff" />
                          <Text style={styles.btnText}>Call</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionBtn, styles.smsBtn]}
                          onPress={() => handleSMS(customer)}
                          activeOpacity={0.8}
                        >
                          <MaterialIcons
                            name="message"
                            size={20}
                            color="#fff"
                          />
                          <Text style={styles.btnText}>Remind</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionBtn, styles.viewBtn]}
                          onPress={() => handleViewTransactions(customer)}
                          activeOpacity={0.8}
                        >
                          <MaterialIcons
                            name="receipt-long"
                            size={20}
                            color="#fff"
                          />
                          <Text style={styles.btnText}>View</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  <View style={styles.rowDivider} />
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Navigation>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  header: {
    paddingTop: 20,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    boxShadow: "0px 4px 8px #0000004D",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "500",
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    boxShadow: "0px 4px 8px #0000004D",
  },
  statItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: "#666",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "#e0e0e0",
    marginHorizontal: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  tableContainer: {
    margin: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    boxShadow: "0px 4px 8px #0000004D",
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 2,
    borderBottomColor: "#e0e0e0",
    alignItems: "center",
  },
  columnHeader: {
    fontSize: 11,
    fontWeight: "800",
    color: "#555",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  nameColumn: {
    flex: 2,
  },
  balanceColumn: {
    flex: 1.2,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  expandColumn: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  rowWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  activeRow: {
    backgroundColor: "#f8f9ff",
  },
  nameCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#c62828",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    boxShadow: "0px 2px 4px #c628284D",
  },
  rankText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#fff",
  },
  cellName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a1a",
    flex: 1,
    lineHeight: 20,
  },
  cellBalance: {
    fontSize: 16,
    fontWeight: "800",
    color: "#c62828",
    textAlign: "right",
  },
  expandedContent: {
    padding: 16,
    backgroundColor: "#fafbfc",
    borderTopWidth: 1,
    borderTopColor: "#e8eaed",
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  phoneIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e3f2fd",
    justifyContent: "center",
    alignItems: "center",
  },
  phoneLabel: {
    fontSize: 11,
    color: "#666",
    fontWeight: "600",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  phoneText: {
    fontSize: 15,
    color: "#1a1a1a",
    fontWeight: "700",
  },
  actionContainer: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
    elevation: 2,
    boxShadow: "0px 2px 4px #00000033",
  },
  callBtn: {
    backgroundColor: "#2e7d32",
  },
  smsBtn: {
    backgroundColor: "#1565c0",
  },
  viewBtn: {
    backgroundColor: "#6a1b9a",
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  rowDivider: {
    height: 1,
    backgroundColor: "#f0f0f0",
  },
});
