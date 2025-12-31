import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Platform,
  Linking,
  Alert,
} from "react-native";
import {
  Text,
  DataTable,
  IconButton,
  ActivityIndicator,
  Divider,
} from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

interface Customer {
  id: string;
  name: string;
  phoneNumber: string;
  cidNumber?: string;
  address?: string;
  email?: string;
  creditLimit?: number;
  isActive?: boolean;
  createdAt: string;
  modifiedAt: string;
}

interface Credit {
  id: string;
  amount: number;
  transactionType: "credit_given" | "payment_received";
  itemsDescription?: string;
  journalNumber?: string;
  transactionDate: string;
  createdAt: string;
}

interface CreditData {
  totalCredit: number;
  usedCredit: number;
  availableCredit: number;
  lastCreditDate?: string;
  credits: Credit[];
}

interface ResponsiveCustomerTableProps {
  readonly searchQuery: string;
  readonly onCustomerDelete: (customerIds: string[]) => void;
  readonly customers: Customer[];
  readonly loading: boolean;
}

export default function ResponsiveCustomerTable({
  searchQuery,
  onCustomerDelete,
  customers,
  loading,
}: ResponsiveCustomerTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [creditData, setCreditData] = useState<Map<string, CreditData>>(
    new Map()
  );
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { width } = useWindowDimensions();

  const isSmallScreen = width < 768;
  const isLargeScreen = width >= 1024;

  const fetchCreditData = async (customerId: string): Promise<CreditData> => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/credits/customer/${customerId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        const credits = Array.isArray(result.data) ? result.data : [];

        const totalCreditGiven = credits
          .filter((c: Credit) => c.transactionType === "credit_given")
          .reduce((sum: number, c: Credit) => sum + Number(c.amount), 0);

        const totalPaymentReceived = credits
          .filter((c: Credit) => c.transactionType === "payment_received")
          .reduce((sum: number, c: Credit) => sum + Number(c.amount), 0);

        const outstandingBalance = totalCreditGiven - totalPaymentReceived;

        return {
          totalCredit: totalCreditGiven,
          usedCredit: totalPaymentReceived,
          availableCredit: outstandingBalance,
          lastCreditDate:
            credits.length > 0 ? credits[0].transactionDate : undefined,
          credits: credits,
        };
      }

      return {
        totalCredit: 0,
        usedCredit: 0,
        availableCredit: 0,
        credits: [],
      };
    } catch (error) {
      console.error("Failed to fetch credit data:", error);
      return {
        totalCredit: 0,
        usedCredit: 0,
        availableCredit: 0,
        credits: [],
      };
    }
  };

  const filteredCustomers = (customers && Array.isArray(customers) ? customers : []).filter(
    (customer) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        customer.name.toLowerCase().includes(query) ||
        customer.phoneNumber.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.cidNumber?.toLowerCase().includes(query)
      );
    }
  );

  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, filteredCustomers.length);
  const paginatedCustomers = filteredCustomers.slice(from, to);

  const toggleRowExpansion = async (customerId: string) => {
    const newExpanded = new Set(expandedRows);

    if (newExpanded.has(customerId)) {
      newExpanded.delete(customerId);
    } else {
      newExpanded.add(customerId);

      if (!creditData.has(customerId)) {
        const data = await fetchCreditData(customerId);
        data.availableCredit = data.totalCredit - data.usedCredit;
        setCreditData(new Map(creditData.set(customerId, data)));
      }
    }

    setExpandedRows(newExpanded);
  };

  const handleEdit = (customer: Customer) => {
    router.push(
      `/customer-dashboard/components/modal?customerId=${customer.id}` as any
    );
  };

  const handleView = (customer: Customer) => {
    router.push(`/customers/${customer.id}` as any);
  };

  const handleDelete = (customerId: string) => {
    onCustomerDelete([customerId]);
  };

  const handleCall = (phoneNumber: string) => {
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert("Error", "Phone calls are not supported on this device");
        }
      })
      .catch(() => {
        Alert.alert("Error", "Failed to open phone call");
      });
  };

  const handleSMS = (phoneNumber: string, customerName: string) => {
    const message = `Hi ${customerName}, this is a message from your store owner.`;
    const url =
      Platform.OS === "ios"
        ? `sms:${phoneNumber}&body=${encodeURIComponent(message)}`
        : `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert("Error", "SMS is not supported on this device");
        }
      })
      .catch(() => {
        Alert.alert("Error", "Failed to open SMS");
      });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return `Nu. ${amount.toLocaleString()}`;
  };

  const renderCreditDetails = (customerId: string) => {
    const credit = creditData.get(customerId);

    if (!credit) {
      return (
        <View style={styles.creditDetailsContainer}>
          <ActivityIndicator size="small" color="#1976d2" />
          <Text style={styles.loadingText}>Loading credit data...</Text>
        </View>
      );
    }

    const totalCreditGiven = credit.credits
      .filter((t) => t.transactionType === "credit_given")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalPaymentReceived = credit.credits
      .filter((t) => t.transactionType === "payment_received")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const outstandingBalance = totalCreditGiven - totalPaymentReceived;

    return (
      <View style={styles.creditDetailsContainer}>
        <View style={styles.summarySection}>
          <View style={styles.summaryCardsRow}>
            <TouchableOpacity
              style={[styles.summaryCardButton, { backgroundColor: "#1976d2" }]}
              onPress={() => router.push(`/give-credit?customerId=${customerId}`)}
              activeOpacity={0.8}
            >
              <View style={styles.summaryCardButtonContent}>
                <View style={styles.summaryCardButtonLeft}>
                  <MaterialIcons name="trending-up" size={24} color="#fff" />
                  <View style={styles.summaryCardButtonTextContainer}>
                    <Text style={styles.summaryCardButtonLabel}>Credit Given</Text>
                    <Text style={styles.summaryCardButtonValue}>
                      {formatCurrency(totalCreditGiven)}
                    </Text>
                  </View>
                </View>
                <MaterialIcons name="add-circle" size={28} color="#fff" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.summaryCardButton, { backgroundColor: "#4caf50" }]}
              onPress={() => router.push(`/payment-received?customerId=${customerId}`)}
              activeOpacity={0.8}
            >
              <View style={styles.summaryCardButtonContent}>
                <View style={styles.summaryCardButtonLeft}>
                  <MaterialIcons name="payments" size={24} color="#fff" />
                  <View style={styles.summaryCardButtonTextContainer}>
                    <Text style={styles.summaryCardButtonLabel}>Payment Received</Text>
                    <Text style={styles.summaryCardButtonValue}>
                      {formatCurrency(totalPaymentReceived)}
                    </Text>
                  </View>
                </View>
                <MaterialIcons name="add-circle" size={28} color="#fff" />
              </View>
            </TouchableOpacity>

            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: outstandingBalance > 0 ? "#fff3e0" : "#e8f5e9",
                  borderLeftColor: outstandingBalance > 0 ? "#ff9800" : "#4caf50",
                },
              ]}
            >
              <View style={styles.summaryCardHeader}>
                <MaterialIcons
                  name="account-balance"
                  size={20}
                  color={outstandingBalance > 0 ? "#ff9800" : "#4caf50"}
                />
                <Text style={styles.summaryCardLabel}>Remaining Credit</Text>
              </View>
              <Text
                style={[
                  styles.summaryCardValue,
                  { color: outstandingBalance > 0 ? "#ff9800" : "#4caf50" },
                ]}
              >
                {formatCurrency(outstandingBalance)}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ alignItems: "flex-start", marginTop: 12 }}>
          <TouchableOpacity
            style={{
              backgroundColor: "#1976d2",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 6,
            }}
            onPress={() => router.push(`/transaction?customerId=${customerId}`)}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              View Transactions
            </Text>
          </TouchableOpacity>
        </View>
        <Divider style={{ marginVertical: 16 }} />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Loading customers...</Text>
      </View>
    );
  }

  if (isSmallScreen) {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.cardContainer}>
          {paginatedCustomers.length === 0 ? (
            <Text style={styles.noTransactions}>No customers found</Text>
          ) : (
            paginatedCustomers.map((customer) => {
              const isExpanded = expandedRows.has(customer.id);
              return (
                <View key={customer.id} style={styles.mobileCustomerCard}>
                  {/* Card Header - Expand Icon, Name, Call and SMS in Single Row */}
                  <View style={styles.mobileCardHeaderContainer}>
                    {/* Expand/Collapse Button */}
                    <TouchableOpacity
                      onPress={() => toggleRowExpansion(customer.id)}
                      activeOpacity={0.7}
                      style={styles.expandIconButton}
                    >
                      <MaterialIcons
                        name={isExpanded ? "expand-less" : "expand-more"}
                        size={24}
                        color="#1976d2"
                      />
                    </TouchableOpacity>

                    {/* Customer Name */}
                    <View style={styles.cardHeaderInfo}>
                      <Text style={styles.customerName}>{customer.name}</Text>
                    </View>

                    {/* Action Buttons */}
                    <TouchableOpacity
                      style={[styles.mobileActionBtn, styles.callBtn]}
                      onPress={() => handleCall(customer.phoneNumber)}
                      activeOpacity={0.8}
                    >
                      <MaterialIcons name="call" size={16} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.mobileActionBtn, styles.smsBtn]}
                      onPress={() => handleSMS(customer.phoneNumber, customer.name)}
                      activeOpacity={0.8}
                    >
                      <MaterialIcons name="sms" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <View style={styles.expandedSection}>
                      {/* Phone Number */}
                      <View style={styles.expandedInfoRow}>
                        <MaterialIcons name="phone" size={18} color="#1976d2" />
                        <View style={styles.expandedInfoContent}>
                          <Text style={styles.expandedInfoLabel}>Phone Number</Text>
                          <Text style={styles.expandedInfoValue}>
                            {customer.phoneNumber}
                          </Text>
                        </View>
                      </View>

                      <Divider style={styles.expandedDivider} />

                      {/* Credit Details */}
                      {renderCreditDetails(customer.id)}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>

        <DataTable.Pagination
          page={page}
          numberOfPages={Math.ceil(filteredCustomers.length / itemsPerPage)}
          onPageChange={(page) => setPage(page)}
          label={`${from + 1}-${to} of ${filteredCustomers.length}`}
          numberOfItemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
          showFastPaginationControls
          selectPageDropdownLabel="Rows"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: "100%" }]}>
      <ScrollView
        horizontal={false}
        contentContainerStyle={{ flexGrow: 1, width: "100%" }}
        showsHorizontalScrollIndicator={false}
      >
        <View style={[styles.tableWrapper, { width: "100%" }]}>
          <DataTable style={[styles.table, { width: "100%" }]}>
            <DataTable.Header>
              <DataTable.Title style={styles.expandCell}></DataTable.Title>
              <DataTable.Title style={styles.nameCell}>Name</DataTable.Title>
              <DataTable.Title style={styles.phoneCell}>Phone</DataTable.Title>
              {isLargeScreen && (
                <DataTable.Title style={styles.dateCell}>Joined Date</DataTable.Title>
              )}
              <DataTable.Title style={styles.actionsCell}>Actions</DataTable.Title>
            </DataTable.Header>

            {paginatedCustomers.length === 0 ? (
              <DataTable.Row>
                <DataTable.Cell style={{ justifyContent: "center" }}>
                  <Text style={styles.noTransactions}>No customers found</Text>
                </DataTable.Cell>
              </DataTable.Row>
            ) : (
              paginatedCustomers.map((customer) => {
                const isExpanded = expandedRows.has(customer.id);
                return (
                  <React.Fragment key={customer.id}>
                    <DataTable.Row>
                      <DataTable.Cell style={styles.expandCell}>
                        <IconButton
                          icon={isExpanded ? "chevron-up" : "chevron-down"}
                          size={20}
                          onPress={() => toggleRowExpansion(customer.id)}
                        />
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.nameCell}>
                        <TouchableOpacity
                          onPress={() => toggleRowExpansion(customer.id)}
                        >
                          <Text style={styles.clickableText}>{customer.name}</Text>
                        </TouchableOpacity>
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.phoneCell}>
                        {customer.phoneNumber}
                      </DataTable.Cell>
                      {isLargeScreen && (
                        <DataTable.Cell style={styles.dateCell}>
                          {formatDate(customer.createdAt)}
                        </DataTable.Cell>
                      )}
                      <DataTable.Cell style={styles.actionsCell}>
                        <View style={styles.actionButtons}>
                          <IconButton
                            icon="eye"
                            size={20}
                            onPress={() => handleView(customer)}
                          />
                          <IconButton
                            icon="pencil"
                            size={20}
                            onPress={() => handleEdit(customer)}
                          />
                          <IconButton
                            icon="delete"
                            size={20}
                            onPress={() => handleDelete(customer.id)}
                          />
                        </View>
                      </DataTable.Cell>
                    </DataTable.Row>

                    {isExpanded && (
                      <View style={styles.tableExpandedRow}>
                        {renderCreditDetails(customer.id)}
                      </View>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </DataTable>
        </View>
      </ScrollView>

      <DataTable.Pagination
        page={page}
        numberOfPages={Math.ceil(filteredCustomers.length / itemsPerPage)}
        onPageChange={(page) => setPage(page)}
        label={`${from + 1}-${to} of ${filteredCustomers.length}`}
        numberOfItemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
        showFastPaginationControls
        selectPageDropdownLabel="Rows per page"
        style={{ width: "100%" }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: { marginTop: 12, color: "#666", fontSize: 16 },
  cardContainer: { flex: 1, padding: 12 },
  mobileCustomerCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  mobileCardHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  expandIconButton: {
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  mobileCardHeaderLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  mobileCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  cardHeaderInfo: { flex: 1 },
  customerName: { fontSize: 15, fontWeight: "700", color: "#1a1a1a" },
  mobileActionButtons: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  mobileActionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  callBtn: { backgroundColor: "#2e7d32", minWidth: 40 },
  smsBtn: { backgroundColor: "#1565c0", minWidth: 40 },
  mobileBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  expandedSection: { padding: 14, backgroundColor: "#fafbfc" },
  expandedInfoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
  },
  expandedInfoContent: { flex: 1 },
  expandedInfoLabel: {
    fontSize: 11,
    color: "#999",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  expandedInfoValue: { fontSize: 14, color: "#1a1a1a", fontWeight: "600" },
  expandedDivider: { marginVertical: 12 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoText: { fontSize: 14, color: "#666" },
  noTransactions: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    paddingVertical: 20,
    fontStyle: "italic",
  },
  tableWrapper: { width: "100%", minWidth: 600, flex: 1 },
  table: { backgroundColor: "#fff", width: "100%", flex: 1 },
  expandCell: { minWidth: 50, justifyContent: "center" },
  nameCell: { minWidth: 180 },
  phoneCell: { minWidth: 140 },
  dateCell: { minWidth: 120 },
  actionsCell: { minWidth: 160, justifyContent: "center" },
  actionButtons: { flexDirection: "row", gap: 4 },
  clickableText: { color: "#1976d2", fontWeight: "600" },
  tableExpandedRow: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  creditDetailsContainer: { padding: 4 },
  summarySection: { marginBottom: 8 },
  summaryCardsRow: { flexDirection: "column", gap: 0 },
  summaryCard: {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    marginBottom: 6,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      },
      android: { elevation: 2 },
    }),
  },
  summaryCardButton: {
    width: "100%",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
    }),
  },
  summaryCardButtonContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  summaryCardButtonLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  summaryCardButtonTextContainer: { flex: 1 },
  summaryCardButtonLabel: { fontSize: 14, fontWeight: "600", color: "#fff", marginBottom: 4 },
  summaryCardButtonValue: { fontSize: 20, fontWeight: "bold", color: "#fff", letterSpacing: 0.3 },
  summaryCardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  summaryCardLabel: { fontSize: 13, fontWeight: "600", color: "#666" },
  summaryCardValue: { fontSize: 18, fontWeight: "bold", letterSpacing: 0.3 },
});