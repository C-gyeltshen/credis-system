import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
} from "react-native";
import { Text, TextInput, Button, Card} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Navigation from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";

interface Customer {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  outstandingBalance: number;
  lastPaymentDate?: string;
  daysSinceLastPayment?: number;
  creditLimit?: number;
  isActive?: boolean;
}

type ReportTab = "overdue" | "balance";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL;

export default function OverdueAccountsReport() {
  const [currentTab, setCurrentTab] = useState<ReportTab>("overdue");
  const [days, setDays] = useState("30");
  const [limit, setLimit] = useState("10");
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const { width } = useWindowDimensions();
  
  const { isAuthenticated, isLoading, user } = useAuth();
  
  const storeID = user?.storeId

  const STORE_ID = storeID
  const isSmallScreen = width < 768;

  const getRiskLevel = (days: number) => {
    if (days > 90)
      return { label: "Critical", color: "#d32f2f", bgColor: "#ffebee" };
    if (days > 60)
      return { label: "High", color: "#f57c00", bgColor: "#fff3e0" };
    if (days > 30)
      return { label: "Medium", color: "#fbc02d", bgColor: "#fffde7" };
    return { label: "Low", color: "#388e3c", bgColor: "#e8f5e9" };
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const generateOverdueReport = async () => {
    if (!days.trim()) {
      Alert.alert("Error", "Please enter number of days");
      return;
    }

    const daysNum = Number(days);
    if (isNaN(daysNum) || daysNum < 1) {
      Alert.alert("Error", "Please enter a valid number greater than 0");
      return;
    }

    try {
      setLoading(true);
      // Updated endpoint and query as per user request
      const response = await fetch(
        `${API_BASE_URL}/customers/overdue?storeId=${STORE_ID}&days=${daysNum}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch overdue accounts");
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setCustomers(data.data);
        setHasSearched(true);

        if (data.data.length === 0) {
          Alert.alert(
            "Good News!",
            `No customers found with payments older than ${daysNum} days.`
          );
        }
      } else {
        throw new Error(data.message || "Invalid response format");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to generate report");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const generateBalanceReport = async () => {
    if (!limit.trim()) {
      Alert.alert("Error", "Please enter a limit");
      return;
    }

    const limitNum = Number(limit);
    if (isNaN(limitNum) || limitNum < 1) {
      Alert.alert("Error", "Please enter a valid number greater than 0");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/credits/store/${STORE_ID}/outstanding?limit=${limitNum}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch highest balances");
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setCustomers(data.data);
        setHasSearched(true);

        if (data.data.length === 0) {
          Alert.alert(
            "No Results",
            "No customers found with outstanding balances."
          );
        }
      } else {
        throw new Error(data.message || "Invalid response format");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to generate report");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = () => {
    if (currentTab === "overdue") {
      generateOverdueReport();
    } else {
      generateBalanceReport();
    }
  };

  // Calculate summary stats
  const totalOutstanding = customers.reduce(
    (sum, c) => sum + (c.outstandingBalance || 0),
    0
  );
  const criticalCount = customers.filter(
    (c) => (c.daysSinceLastPayment || 0) > 90
  ).length;
  const highCount = customers.filter(
    (c) =>
      (c.daysSinceLastPayment || 0) > 60 && (c.daysSinceLastPayment || 0) <= 90
  ).length;

  const RenderOverdueCustomer = ({
    customer,
    index,
  }: {
    customer: Customer;
    index: number;
  }) => {
    const risk = getRiskLevel(customer.daysSinceLastPayment || 0);
    const lastPaymentDate = formatDate(customer.lastPaymentDate);

    return (
      <Card style={[styles.customerCard, { marginBottom: 12 }]}>
        <Card.Content>
          <View style={styles.customerHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.customerName}>{customer.name}</Text>
              <View style={styles.customerMeta}>
                <MaterialIcons name="phone" size={12} color="#666" />
                <Text style={styles.customerMetaText}>
                  {customer.phoneNumber}
                </Text>
              </View>
              <View style={styles.customerMeta}>
                <MaterialIcons name="email" size={12} color="#666" />
                <Text style={styles.customerMetaText}>{customer.email}</Text>
              </View>
            </View>
            <View
              style={[
                styles.riskBadge,
                { backgroundColor: risk.bgColor, borderColor: risk.color },
              ]}
            >
              <MaterialIcons
                name={
                  risk.label === "Critical"
                    ? "error"
                    : risk.label === "High"
                    ? "warning"
                    : "info"
                }
                size={14}
                color={risk.color}
              />
              <Text style={[styles.riskLabel, { color: risk.color }]}>
                {risk.label}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.customerDetails}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Last Payment Date</Text>
              <Text style={styles.detailValue}>{lastPaymentDate}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Days Since Payment</Text>
              <Text style={[styles.detailValue, { color: risk.color }]}>
                {customer.daysSinceLastPayment} days
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Outstanding Balance</Text>
              <Text
                style={[
                  styles.detailValue,
                  { color: "#d32f2f", fontWeight: "bold" },
                ]}
              >
                Nu. {formatCurrency(customer.outstandingBalance)}
              </Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionBtn, { flex: 1, marginRight: 6 }]}
            >
              <MaterialIcons name="phone" size={16} color="#388e3c" />
              <Text style={[styles.actionBtnText, { color: "#388e3c" }]}>
                Call
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { flex: 1, marginHorizontal: 3 }]}
            >
              <MaterialIcons name="message" size={16} color="#1976d2" />
              <Text style={[styles.actionBtnText, { color: "#1976d2" }]}>
                Message
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { flex: 1, marginLeft: 6 }]}
            >
              <MaterialIcons name="receipt" size={16} color="#f57c00" />
              <Text style={[styles.actionBtnText, { color: "#f57c00" }]}>
                Details
              </Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const RenderBalanceCustomer = ({
    customer,
    index,
  }: {
    customer: Customer;
    index: number;
  }) => {
    const rank = index + 1;
    const isTop3 = rank <= 3;
    const percentageUsed = customer.creditLimit
      ? Math.round((customer.outstandingBalance / customer.creditLimit) * 100)
      : 0;

    return (
      <Card style={[styles.customerCard, { marginBottom: 12 }]}>
        <Card.Content>
          <View style={styles.customerHeader}>
            <View
              style={[
                styles.rankBadge,
                { backgroundColor: isTop3 ? "#fbc02d" : "#c62828" },
              ]}
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "800",
                  fontSize: 16,
                }}
              >
                #{rank}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.customerName}>{customer.name}</Text>
              <View style={styles.customerMeta}>
                <MaterialIcons name="phone" size={12} color="#666" />
                <Text style={styles.customerMetaText}>
                  {customer.phoneNumber}
                </Text>
              </View>
              <View style={styles.customerMeta}>
                <MaterialIcons name="email" size={12} color="#666" />
                <Text style={styles.customerMetaText}>{customer.email}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View
            style={[
              styles.balanceHighlight,
              {
                backgroundColor: "#ffebee",
                borderLeftColor: "#c62828",
              },
            ]}
          >
            <Text style={styles.detailLabel}>Outstanding Balance</Text>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "800",
                color: "#c62828",
                marginTop: 4,
              }}
            >
              Nu. {formatCurrency(customer.outstandingBalance)}
            </Text>
          </View>

          <View style={[styles.customerDetails, { marginTop: 12 }]}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Credit Limit</Text>
              <Text style={styles.detailValue}>
                Nu. {formatCurrency(customer.creditLimit || 0)}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Account Status</Text>
              <Text style={styles.detailValue}>
                {customer.isActive ? "✓ Active" : "✗ Inactive"}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>% of Limit Used</Text>
              <Text style={[styles.detailValue, { color: "#c62828" }]}>
                {percentageUsed}%
              </Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionBtn, { flex: 1, marginRight: 6 }]}
            >
              <MaterialIcons name="phone" size={16} color="#388e3c" />
              <Text style={[styles.actionBtnText, { color: "#388e3c" }]}>
                Call
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { flex: 1, marginHorizontal: 3 }]}
            >
              <MaterialIcons name="message" size={16} color="#1976d2" />
              <Text style={[styles.actionBtnText, { color: "#1976d2" }]}>
                Message
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { flex: 1, marginLeft: 6 }]}
            >
              <MaterialIcons name="receipt" size={16} color="#f57c00" />
              <Text style={[styles.actionBtnText, { color: "#f57c00" }]}>
                Details
              </Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <Navigation>
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={["#c62828", "#e53935"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { padding: isSmallScreen ? 16 : 20 }]}
        >
          <View style={styles.headerContent}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Overdue Accounts</Text>
              <Text style={styles.headerSubtitle}>
                Track and follow up on customers with overdue payments
              </Text>
            </View>
            <MaterialIcons name="warning" size={40} color="#fff" />
          </View>
        </LinearGradient>

        {/* Tab Navigation */}
        <View
          style={[
            styles.tabsContainer,
            { marginHorizontal: isSmallScreen ? 12 : 16 },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.tabButton,
              currentTab === "overdue" && styles.tabButtonActive,
            ]}
            onPress={() => {
              setCurrentTab("overdue");
              setHasSearched(false);
              setCustomers([]);
            }}
          >
            <MaterialIcons
              name="schedule"
              size={18}
              color={currentTab === "overdue" ? "#fff" : "#666"}
            />
            <Text
              style={[
                styles.tabButtonText,
                currentTab === "overdue" && styles.tabButtonTextActive,
              ]}
            >
              Overdue Payments
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              currentTab === "balance" && styles.tabButtonActive,
            ]}
            onPress={() => {
              setCurrentTab("balance");
              setHasSearched(false);
              setCustomers([]);
            }}
          >
            <MaterialIcons
              name="trending-up"
              size={18}
              color={currentTab === "balance" ? "#fff" : "#666"}
            />
            <Text
              style={[
                styles.tabButtonText,
                currentTab === "balance" && styles.tabButtonTextActive,
              ]}
            >
              Highest Balances
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filter Card */}
        <View
          style={[
            styles.filterCard,
            { marginHorizontal: isSmallScreen ? 12 : 16 },
          ]}
        >
          <View style={styles.filterHeader}>
            <MaterialIcons name="tune" size={24} color="#c62828" />
            <Text style={styles.filterTitle}>Report Filters</Text>
          </View>

          <View style={styles.filterContent}>
            {currentTab === "overdue" ? (
              <>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Days Since Last Payment</Text>
                  <TextInput
                    label="Enter days"
                    value={days}
                    onChangeText={setDays}
                    keyboardType="number-pad"
                    mode="outlined"
                    style={styles.input}
                    outlineColor="#e0e0e0"
                    activeOutlineColor="#c62828"
                    left={<TextInput.Icon icon="calendar" />}
                  />
                  <Text style={styles.inputHint}>
                    Shows customers whose last payment was older than this many
                    days
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Top Customers (Limit)</Text>
                  <TextInput
                    label="Enter limit"
                    value={limit}
                    onChangeText={setLimit}
                    keyboardType="number-pad"
                    mode="outlined"
                    style={styles.input}
                    outlineColor="#e0e0e0"
                    activeOutlineColor="#c62828"
                    left={<TextInput.Icon icon="list" />}
                  />
                  <Text style={styles.inputHint}>
                    Shows top customers ranked by outstanding balance
                  </Text>
                </View>
              </>
            )}

            <Button
              mode="contained"
              onPress={handleGenerateReport}
              loading={loading}
              disabled={loading}
              buttonColor="#c62828"
              style={styles.generateButton}
              contentStyle={{ paddingVertical: 8 }}
              icon="refresh"
            >
              Generate
            </Button>
          </View>
        </View>

        {/* Results Summary */}
        {hasSearched && customers.length > 0 && (
          <View
            style={[
              styles.summaryContainer,
              { marginHorizontal: isSmallScreen ? 12 : 16 },
            ]}
          >
            <View style={styles.summaryGrid}>
              <Card style={[styles.summaryCard, { flex: 1, marginRight: 6 }]}>
                <Card.Content style={{ alignItems: "center" }}>
                  <Text style={styles.summaryLabel}>Total Customers</Text>
                  <Text style={styles.summaryValue}>{customers.length}</Text>
                </Card.Content>
              </Card>
              <Card style={[styles.summaryCard, { flex: 1, marginLeft: 6 }]}>
                <Card.Content style={{ alignItems: "center" }}>
                  <Text style={styles.summaryLabel}>Total Outstanding</Text>
                  <Text style={[styles.summaryValue, { color: "#d32f2f" }]}>
                    Nu. {formatCurrency(totalOutstanding)}
                  </Text>
                </Card.Content>
              </Card>
            </View>
            {currentTab === "overdue" && (
              <View style={[styles.summaryGrid, { marginTop: 12 }]}>
                <Card style={[styles.summaryCard, { flex: 1, marginRight: 6 }]}>
                  <Card.Content style={{ alignItems: "center" }}>
                    <Text style={styles.summaryLabel}>Critical Risk</Text>
                    <Text style={[styles.summaryValue, { color: "#d32f2f" }]}>
                      {criticalCount}
                    </Text>
                  </Card.Content>
                </Card>
                <Card style={[styles.summaryCard, { flex: 1, marginLeft: 6 }]}>
                  <Card.Content style={{ alignItems: "center" }}>
                    <Text style={styles.summaryLabel}>High Risk</Text>
                    <Text style={[styles.summaryValue, { color: "#f57c00" }]}>
                      {highCount}
                    </Text>
                  </Card.Content>
                </Card>
              </View>
            )}
          </View>
        )}

        {/* Customers List */}
        {hasSearched && customers.length > 0 && (
          <View
            style={[
              styles.listContainer,
              { marginHorizontal: isSmallScreen ? 12 : 16 },
            ]}
          >
            <View style={styles.listHeader}>
              <MaterialIcons name="list-alt" size={24} color="#c62828" />
              <Text style={styles.listTitle}>
                {currentTab === "overdue"
                  ? `Overdue Customers (${customers.length})`
                  : `Top ${customers.length} Customers by Balance`}
              </Text>
            </View>

            {customers.map((customer, index) =>
              currentTab === "overdue" ? (
                <RenderOverdueCustomer
                  key={customer.id}
                  customer={customer}
                  index={index}
                />
              ) : (
                <RenderBalanceCustomer
                  key={customer.id}
                  customer={customer}
                  index={index}
                />
              )
            )}
          </View>
        )}

        {/* Empty State */}
        {hasSearched && customers.length === 0 && (
          <View
            style={[
              styles.emptyState,
              { marginHorizontal: isSmallScreen ? 12 : 16 },
            ]}
          >
            <MaterialIcons name="check-circle" size={64} color="#388e3c" />
            <Text style={styles.emptyStateTitle}>No Results Found</Text>
            <Text style={styles.emptyStateText}>
              {currentTab === "overdue"
                ? `All customers have made payments within the last ${days} days.`
                : "No customers found with outstanding balances."}
            </Text>
          </View>
        )}

        {/* Legend */}
        {hasSearched && customers.length > 0 && currentTab === "overdue" && (
          <View
            style={[
              styles.legend,
              { marginHorizontal: isSmallScreen ? 12 : 16 },
            ]}
          >
            <Text style={styles.legendTitle}>Risk Levels</Text>
            <View style={styles.legendItems}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendColor, { backgroundColor: "#d32f2f" }]}
                />
                <Text style={styles.legendText}>Critical: {">"} 90 days</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendColor, { backgroundColor: "#f57c00" }]}
                />
                <Text style={styles.legendText}>High: 61-90 days</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendColor, { backgroundColor: "#fbc02d" }]}
                />
                <Text style={styles.legendText}>Medium: 31-60 days</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendColor, { backgroundColor: "#388e3c" }]}
                />
                <Text style={styles.legendText}>Low: {"<"} 30 days</Text>
              </View>
            </View>
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
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    paddingVertical: 24,
    marginBottom: 20,
    elevation: 4,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  tabsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: "#c62828",
    borderColor: "#c62828",
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  tabButtonTextActive: {
    color: "#fff",
  },
  filterCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginLeft: 8,
  },
  filterContent: {
    gap: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
  },
  inputHint: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
    fontStyle: "italic",
  },
  generateButton: {
    marginTop: 8,
  },
  summaryContainer: {
    marginBottom: 20,
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 12,
  },
  summaryCard: {
    backgroundColor: "#fff",
    elevation: 2,
    boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1a1a1a",
  },
  listContainer: {
    marginBottom: 20,
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginLeft: 8,
  },
  customerCard: {
    backgroundColor: "#fff",
    elevation: 2,
    boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
  },
  customerHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  customerMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 4,
  },
  customerMetaText: {
    fontSize: 12,
    color: "#666",
  },
  riskBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
  },
  riskLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  rankBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginBottom: 12,
  },
  customerDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  balanceHighlight: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    backgroundColor: "#fff",
    gap: 4,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 48,
    alignItems: "center",
    marginTop: 20,
    elevation: 2,
    boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginTop: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  legend: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  legendItems: {
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 13,
    color: "#666",
  },
});