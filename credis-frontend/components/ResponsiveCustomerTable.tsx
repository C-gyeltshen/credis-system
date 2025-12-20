import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Platform,
  KeyboardAvoidingView,
  TextInput,
} from "react-native";
import {
  Text,
  DataTable,
  IconButton,
  ActivityIndicator,
  Divider,
  Portal,
  Modal,
  RadioButton,
  Button,
} from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { MockCustomerService } from "@/lib/mock-customer-service";

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
  const [creditModalVisible, setCreditModalVisible] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null
  );
  const [creditTransactionType, setCreditTransactionType] = useState<
    "credit_given" | "credit_received"
  >("credit_given");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [journalNumber, setJournalNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const { width } = useWindowDimensions();

  // Responsive breakpoints
  const isSmallScreen = width < 768;
  const isMediumScreen = width >= 768 && width < 1024;
  const isLargeScreen = width >= 1024;

  // Customers are now received from props

  // Fetch credit data from API
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

        // Calculate totals from credits
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

      // Fallback to empty data if API response is unexpected
      return {
        totalCredit: 0,
        usedCredit: 0,
        availableCredit: 0,
        credits: [],
      };
    } catch (error) {
      console.error("Failed to fetch credit data:", error);

      // Return empty data on error
      return {
        totalCredit: 0,
        usedCredit: 0,
        availableCredit: 0,
        credits: [],
      };
    }
  };

  // Filter customers based on search query
  const filteredCustomers = customers.filter((customer) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      customer.name.toLowerCase().includes(query) ||
      customer.phoneNumber.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.cidNumber?.toLowerCase().includes(query)
    );
  });

  // Pagination
  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, filteredCustomers.length);
  const paginatedCustomers = filteredCustomers.slice(from, to);

  // Toggle row expansion
  const toggleRowExpansion = async (customerId: string) => {
    const newExpanded = new Set(expandedRows);

    if (newExpanded.has(customerId)) {
      newExpanded.delete(customerId);
    } else {
      newExpanded.add(customerId);

      // Fetch credit data if not already loaded
      if (!creditData.has(customerId)) {
        const data = await fetchCreditData(customerId);
        data.availableCredit = data.totalCredit - data.usedCredit;
        setCreditData(new Map(creditData.set(customerId, data)));
      }
    }

    setExpandedRows(newExpanded);
  };

  // Action handlers
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

  const openCreditModal = (
    customerId: string,
    type: "credit_given" | "payment_received"
  ) => {
    // Find the customer to get their name
    const customer = customers.find((c) => c.id === customerId);
    const customerName = customer?.name || "";

    // Navigate to credit-modal with customer info
    router.push(
      `/customer-dashboard/components/credit-modal?customerId=${customerId}&customerName=${encodeURIComponent(
        customerName
      )}&type=${type}` as any
    );
  };

  const closeCreditModal = () => {
    setCreditModalVisible(false);
    setSelectedCustomerId(null);
    setAmount("");
    setDescription("");
    setJournalNumber("");
    setPaymentMethod("");
  };

  const handleSubmitCredit = async () => {
    if (!amount || !selectedCustomerId) {
      return;
    }

    try {
      // TODO: Make API call to save credit transaction
      console.log("Submitting credit transaction:", {
        customerId: selectedCustomerId,
        type: creditTransactionType,
        amount: parseFloat(amount),
        description,
        paymentMethod,
      });

      // Close modal and reset form
      closeCreditModal();

      // TODO: Refresh customer data or credit history
    } catch (error) {
      console.error("Error submitting credit transaction:", error);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `Nu. ${amount.toLocaleString()}`;
  };

  // Render credit details expanded row
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

    // Calculate totals from credits
    const totalCreditGiven = credit.credits
      .filter((t) => t.transactionType === "credit_given")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalPaymentReceived = credit.credits
      .filter((t) => t.transactionType === "payment_received")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const outstandingBalance = totalCreditGiven - totalPaymentReceived;

    const creditUtilization =
      totalCreditGiven > 0 ? (outstandingBalance / totalCreditGiven) * 100 : 0;
    const isHighUtilization = creditUtilization > 80;

    return (
      <View style={styles.creditDetailsContainer}>
        {/* Transaction Summary Section */}
        <View style={styles.summarySection}>
          <View style={styles.summarySectionHeader}>
            <Text style={styles.summarySectionTitle}>
              <MaterialIcons name="analytics" size={16} color="#1a1a1a" />{" "}
              Summary
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.transactionActionBtn,
              { backgroundColor: "#e3f2fd", marginBottom: 12 },
            ]}
            onPress={() => openCreditModal(customerId, "credit_given")}
          >
            <MaterialIcons name="add-circle" size={18} color="#1976d2" />
            <Text
              style={[
                styles.transactionActionText,
                { color: "#1976d2", marginLeft: 6 },
              ]}
            >
              Add Credit
            </Text>
          </TouchableOpacity>
          <View style={styles.summaryCardsRow}>
            <View
              style={[
                styles.summaryCard,
                { backgroundColor: "#e3f2fd", borderLeftColor: "#1976d2" },
              ]}
            >
              <View style={styles.summaryCardHeader}>
                <MaterialIcons name="trending-up" size={20} color="#1976d2" />
                <Text style={styles.summaryCardLabel}>Credit Given</Text>
              </View>
              <Text style={[styles.summaryCardValue, { color: "#1976d2" }]}>
                {formatCurrency(totalCreditGiven)}
              </Text>
            </View>

            <View
              style={[
                styles.summaryCard,
                { backgroundColor: "#e8f5e9", borderLeftColor: "#4caf50" },
              ]}
            >
              <View style={styles.summaryCardHeader}>
                <MaterialIcons name="payments" size={20} color="#4caf50" />
                <Text style={styles.summaryCardLabel}>Payment Received</Text>
              </View>
              <Text style={[styles.summaryCardValue, { color: "#4caf50" }]}>
                {formatCurrency(totalPaymentReceived)}
              </Text>
            </View>

            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor:
                    outstandingBalance > 0 ? "#fff3e0" : "#e8f5e9",
                  borderLeftColor:
                    outstandingBalance > 0 ? "#ff9800" : "#4caf50",
                },
              ]}
            >
              <View style={styles.summaryCardHeader}>
                <MaterialIcons
                  name="account-balance"
                  size={20}
                  color={outstandingBalance > 0 ? "#ff9800" : "#4caf50"}
                />
                <Text style={styles.summaryCardLabel}>Outstanding Balance</Text>
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

        <Divider style={{ marginVertical: 16 }} />

        {/* Credit Utilization Bar */}
        <View style={styles.utilizationSection}>
          <View style={styles.utilizationHeader}>
            <Text style={styles.utilizationLabel}>Credit Utilization</Text>
            <Text style={styles.utilizationPercentage}>
              {creditUtilization.toFixed(1)}%
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${creditUtilization}%`,
                  backgroundColor: (() => {
                    if (isHighUtilization) return "#d32f2f";
                    if (creditUtilization > 50) return "#ff9800";
                    return "#4caf50";
                  })(),
                },
              ]}
            />
          </View>
        </View>

        <Divider style={{ marginVertical: 16 }} />

        {/* Credit History */}
        <View style={styles.creditHistorySection}>
          <Text style={styles.creditHistoryTitle}>
            <MaterialIcons name="history" size={18} color="#1a1a1a" /> Recent
            Transactions
          </Text>

          {credit.credits.map((transaction, index) => {
            const isCreditGiven =
              transaction.transactionType === "credit_given";
            const iconBackgroundColor = isCreditGiven ? "#e3f2fd" : "#e8f5e9";
            const iconName = isCreditGiven ? "add-circle" : "remove-circle";
            const iconColor = isCreditGiven ? "#1976d2" : "#4caf50";
            const description =
              transaction.itemsDescription ||
              (isCreditGiven ? "Credit Given" : "Payment Received");

            return (
              <View key={transaction.id} style={styles.transactionRow}>
                <View style={styles.transactionLeft}>
                  <View
                    style={[
                      styles.transactionIcon,
                      { backgroundColor: iconBackgroundColor },
                    ]}
                  >
                    <MaterialIcons
                      name={iconName}
                      size={20}
                      color={iconColor}
                    />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionDescription}>
                      {description}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {formatDate(transaction.transactionDate)}
                    </Text>
                    {transaction.journalNumber && (
                      <Text style={styles.transactionJournal}>
                        Journal: {transaction.journalNumber}
                      </Text>
                    )}
                  </View>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    {
                      color: isCreditGiven ? "#1976d2" : "#4caf50",
                    },
                  ]}
                >
                  {isCreditGiven ? "+" : "-"}
                  {formatCurrency(Number(transaction.amount))}
                </Text>
              </View>
            );
          })}

          {credit.credits.length === 0 && (
            <Text style={styles.noTransactions}>No transactions yet</Text>
          )}
        </View>
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

  // Render Credit Transaction Modal (shared by both mobile and desktop views)
  const renderCreditModal = () => {
    const customer = customers.find((c) => c.id === selectedCustomerId);
    const isCreditGiven = creditTransactionType === "credit_given";

    return (
      <Portal>
        <Modal
          visible={creditModalVisible}
          onDismiss={closeCreditModal}
          contentContainerStyle={styles.modalContainer}
          dismissable={true}
          dismissableBackButton={true}
        >
          <View style={styles.modalContentWrapper}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Add Transaction</Text>
                {customer && (
                  <Text style={styles.modalSubtitle}>{customer.name}</Text>
                )}
              </View>
              <IconButton icon="close" size={24} onPress={closeCreditModal} />
            </View>

            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{ flex: 1 }}
              keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
            >
              <ScrollView
                style={styles.modalBody}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                {/* Transaction Type Section */}
                <View style={styles.modalSection}>
                  <View style={styles.modalSectionHeader}>
                    <MaterialIcons
                      name="swap-horiz"
                      size={20}
                      color="#1976d2"
                    />
                    <Text style={styles.modalSectionTitle}>
                      Transaction Type
                    </Text>
                  </View>

                  <RadioButton.Group
                    onValueChange={(value) =>
                      setCreditTransactionType(
                        value as "credit_given" | "credit_received"
                      )
                    }
                    value={creditTransactionType}
                  >
                    <View style={styles.radioOption}>
                      <RadioButton value="credit_given" color="#1976d2" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.radioLabel}>Credit Given</Text>
                        <Text style={styles.radioDescription}>
                          Customer receives goods/services on credit
                        </Text>
                      </View>
                      <MaterialIcons
                        name="add-circle"
                        size={24}
                        color="#1976d2"
                      />
                    </View>
                    <View style={[styles.radioOption, { marginTop: 12 }]}>
                      <RadioButton value="payment_received" color="#4caf50" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.radioLabel}>Payment Received</Text>
                        <Text style={styles.radioDescription}>
                          Customer makes a payment towards credit
                        </Text>
                      </View>
                      <MaterialIcons
                        name="remove-circle"
                        size={24}
                        color="#4caf50"
                      />
                    </View>
                  </RadioButton.Group>
                </View>

                <Divider style={styles.modalDivider} />

                {/* Transaction Details Section */}
                <View style={styles.modalSection}>
                  <View style={styles.modalSectionHeader}>
                    <MaterialIcons name="receipt" size={20} color="#1976d2" />
                    <Text style={styles.modalSectionTitle}>
                      Transaction Details
                    </Text>
                  </View>

                  <TextInput
                    label="Amount *"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                    mode="outlined"
                    style={styles.modalInput}
                    left={<TextInput.Affix text="Nu. " />}
                    right={<TextInput.Icon icon="currency-rupee" />}
                    outlineColor="#ccc"
                    activeOutlineColor="#1976d2"
                    theme={{ colors: { primary: "#1976d2" } }}
                  />

                  <TextInput
                    label="Description"
                    value={description}
                    onChangeText={setDescription}
                    mode="outlined"
                    multiline
                    numberOfLines={3}
                    style={styles.modalInput}
                    placeholder={
                      isCreditGiven
                        ? "Items purchased (e.g., Rice, Oil, Sugar)"
                        : "Payment details"
                    }
                    left={<TextInput.Icon icon="text" />}
                    outlineColor="#ccc"
                    activeOutlineColor="#1976d2"
                    theme={{ colors: { primary: "#1976d2" } }}
                  />

                  <TextInput
                    label="Journal Number"
                    value={journalNumber}
                    onChangeText={setJournalNumber}
                    mode="outlined"
                    style={styles.modalInput}
                    placeholder="Optional reference number"
                    left={<TextInput.Icon icon="file-document" />}
                    outlineColor="#ccc"
                    activeOutlineColor="#1976d2"
                    theme={{ colors: { primary: "#1976d2" } }}
                  />

                  <View style={styles.infoBox}>
                    <MaterialIcons
                      name="info"
                      size={16}
                      color={isCreditGiven ? "#1976d2" : "#4caf50"}
                    />
                    <Text
                      style={[
                        styles.infoText,
                        {
                          color: isCreditGiven ? "#1976d2" : "#4caf50",
                        },
                      ]}
                    >
                      {isCreditGiven
                        ? "This will increase the customer's outstanding balance"
                        : "This will reduce the customer's outstanding balance"}
                    </Text>
                  </View>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.modalFooter}>
              <Button
                mode="outlined"
                onPress={closeCreditModal}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSubmitCredit}
                style={styles.modalButton}
                disabled={!amount}
                buttonColor={isCreditGiven ? "#1976d2" : "#4caf50"}
                icon={isCreditGiven ? "plus" : "check"}
              >
                {isCreditGiven ? "Add Credit" : "Record Payment"}
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
    );
  };

  // Mobile Card View (Small Screens)
  if (isSmallScreen) {
    return (
      <>
        <View style={styles.container}>
          <ScrollView style={styles.cardContainer}>
            {paginatedCustomers.map((customer) => {
              const isExpanded = expandedRows.has(customer.id);
              return (
                <View key={customer.id} style={styles.customerCard}>
                  <TouchableOpacity
                    onPress={() => toggleRowExpansion(customer.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.cardHeaderInfo}>
                        <Text style={styles.customerName}>{customer.name}</Text>
                      </View>
                      <MaterialIcons
                        name={isExpanded ? "expand-less" : "expand-more"}
                        size={24}
                        color="#666"
                      />
                    </View>

                    <View style={styles.cardBody}>
                      <View style={styles.infoRow}>
                        <MaterialIcons name="phone" size={16} color="#666" />
                        <Text style={styles.infoText}>
                          {customer.phoneNumber}
                        </Text>
                      </View>
                      {customer.email && (
                        <View style={styles.infoRow}>
                          <MaterialIcons name="email" size={16} color="#666" />
                          <Text style={styles.infoText}>{customer.email}</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.expandedSection}>
                      <Divider style={{ marginVertical: 12 }} />
                      {renderCreditDetails(customer.id)}

                      {/* Action Buttons */}
                      <View style={styles.cardActions}>
                        <TouchableOpacity
                          style={[
                            styles.cardActionButton,
                            { backgroundColor: "#e8f5e9" },
                          ]}
                          onPress={() =>
                            openCreditModal(customer.id, "credit_given")
                          }
                        >
                          <MaterialIcons
                            name="add-circle"
                            size={18}
                            color="#4caf50"
                          />
                          <Text
                            style={[
                              styles.cardActionText,
                              { color: "#4caf50" },
                            ]}
                          >
                            Add Credit
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.cardActionButton,
                            { backgroundColor: "#e3f2fd" },
                          ]}
                          onPress={() => handleView(customer)}
                        >
                          <MaterialIcons
                            name="visibility"
                            size={18}
                            color="#1976d2"
                          />
                          <Text
                            style={[
                              styles.cardActionText,
                              { color: "#1976d2" },
                            ]}
                          >
                            View
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.cardActionButton,
                            { backgroundColor: "#f3e5f5" },
                          ]}
                          onPress={() => handleEdit(customer)}
                        >
                          <MaterialIcons
                            name="edit"
                            size={18}
                            color="#9c27b0"
                          />
                          <Text
                            style={[
                              styles.cardActionText,
                              { color: "#9c27b0" },
                            ]}
                          >
                            Edit
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.cardActionButton,
                            { backgroundColor: "#ffebee" },
                          ]}
                          onPress={() => handleDelete(customer.id)}
                        >
                          <MaterialIcons
                            name="delete"
                            size={18}
                            color="#d32f2f"
                          />
                          <Text
                            style={[
                              styles.cardActionText,
                              { color: "#d32f2f" },
                            ]}
                          >
                            Delete
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
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
        {renderCreditModal()}
      </>
    );
  }

  // Tablet/Desktop Table View (Medium and Large Screens)
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View style={styles.tableWrapper}>
          <DataTable style={styles.table}>
            <DataTable.Header>
              <DataTable.Title style={styles.expandCell}> </DataTable.Title>
              <DataTable.Title style={styles.nameCell}>Name</DataTable.Title>
              <DataTable.Title style={styles.phoneCell}>Phone</DataTable.Title>
              {!isMediumScreen && (
                <DataTable.Title style={styles.emailCell}>
                  Email
                </DataTable.Title>
              )}
              <DataTable.Title style={styles.statusCell}>
                Credit Limit
              </DataTable.Title>
              {isLargeScreen && (
                <DataTable.Title style={styles.dateCell}>
                  Joined Date
                </DataTable.Title>
              )}
              <DataTable.Title style={styles.actionsCell}>
                Actions
              </DataTable.Title>
            </DataTable.Header>

            {paginatedCustomers.map((customer) => {
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
                        <Text style={styles.clickableText}>
                          {customer.name}
                        </Text>
                      </TouchableOpacity>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.phoneCell}>
                      {customer.phoneNumber}
                    </DataTable.Cell>
                    {!isMediumScreen && (
                      <DataTable.Cell style={styles.emailCell}>
                        {customer.email || "-"}
                      </DataTable.Cell>
                    )}
                    <DataTable.Cell style={styles.statusCell}>
                      <Text style={styles.creditLimitText}>
                        {customer.creditLimit
                          ? formatCurrency(customer.creditLimit)
                          : "-"}
                      </Text>
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
            })}
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
      />

      {renderCreditModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 16,
  },
  bulkActionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  bulkActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1976d2",
  },
  bulkDeleteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d32f2f",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  bulkDeleteText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  // Mobile Card Styles
  cardContainer: {
    flex: 1,
  },
  customerCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardHeaderInfo: {
    flex: 1,
    marginLeft: 8,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  cardBody: {
    marginLeft: 48,
    marginTop: 8,
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
  },
  statusChip: {
    alignSelf: "flex-start",
    height: 24,
  },
  activeChip: {
    backgroundColor: "#e8f5e9",
  },
  inactiveChip: {
    backgroundColor: "#ffebee",
  },
  chipText: {
    fontSize: 11,
    fontWeight: "600",
  },
  expandedSection: {
    marginTop: 8,
  },
  cardActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 12,
  },
  cardActionButton: {
    flex: 1,
    minWidth: "47%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 6,
    gap: 4,
  },
  cardActionText: {
    fontSize: 13,
    fontWeight: "600",
  },
  // Table Styles
  tableWrapper: {
    minWidth: "100%",
  },
  table: {
    backgroundColor: "#fff",
  },
  expandCell: {
    minWidth: 50,
    justifyContent: "center",
  },
  checkboxCell: {
    minWidth: 80,
    maxWidth: 80,
    justifyContent: "center",
    alignItems: "center",
    marginEnd: 4,
  },
  checkboxWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  nameCell: {
    minWidth: 180,
  },
  phoneCell: {
    minWidth: 140,
  },
  emailCell: {
    minWidth: 200,
  },
  statusCell: {
    minWidth: 100,
  },
  dateCell: {
    minWidth: 120,
  },
  actionsCell: {
    minWidth: 160,
    justifyContent: "center",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 4,
  },
  clickableText: {
    color: "#1976d2",
    fontWeight: "600",
  },
  creditLimitText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1976d2",
  },
  tableExpandedRow: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  // Credit Details Styles
  creditDetailsContainer: {
    padding: 4,
  },
  creditSummaryScrollView: {
    marginBottom: 16,
  },
  creditSummaryRow: {
    flexDirection: "row",
    gap: 12,
  },
  creditCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 120,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  creditCardLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
    marginBottom: 4,
    fontWeight: "500",
  },
  creditCardValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  utilizationSection: {
    marginBottom: 8,
  },
  utilizationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  utilizationLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  utilizationPercentage: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1976d2",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  creditHistorySection: {
    gap: 12,
  },
  creditHistoryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 6,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: "#666",
  },
  transactionJournal: {
    fontSize: 11,
    color: "#999",
    fontStyle: "italic",
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
  noTransactions: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    paddingVertical: 20,
    fontStyle: "italic",
  },
  // Summary Section Styles
  summarySection: {
    marginBottom: 8,
  },
  summarySectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  summaryCardsRow: {
    flexDirection: "column",
    gap: 0,
  },
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
      android: {
        elevation: 2,
      },
    }),
  },
  summaryCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  summaryCardLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  summaryCardValue: {
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.3,
  },
  summarySectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  transactionActions: {
    flexDirection: "row",
    gap: 8,
  },
  transactionActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    width: "100%",
  },
  transactionActionText: {
    fontSize: 13,
    fontWeight: "600",
  },
  // Modal Styles
  modalContainer: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 16,
    maxHeight: "90%",
    width: "90%",
    maxWidth: 600,
    alignSelf: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  modalContentWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    flex: 1,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  modalBody: {
    flex: 1,
    padding: 16,
  },
  modalSection: {
    marginBottom: 8,
  },
  modalSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  modalDivider: {
    marginVertical: 16,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  radioLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a1a",
    marginLeft: 8,
  },
  radioDescription: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
    marginTop: 2,
  },
  modalInput: {
    marginBottom: 16,
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#1976d2",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#e3f2fd",
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  modalButton: {
    flex: 1,
  },
});
