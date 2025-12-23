import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import {
  Card,
  Text,
  DataTable,
  Checkbox,
  Button,
  IconButton,
  Chip,
  Surface,
} from "react-native-paper";

import { MockCustomerService } from "../lib/mock-customer-service";

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

interface CreditHistory {
  id: string;
  transactionDate: string;
  transactionType: "credit_given" | "payment_received";
  amount: number;
  description?: string;
  itemsDescription?: string;
  journalNumber?: string;
  referenceNumber?: string;
}

interface AdvancedCustomerTablesProps {
  onCustomerDelete?: (customerIds: string[]) => void;
}

export default function AdvancedCustomerTables({
  onCustomerDelete,
}: AdvancedCustomerTablesProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(
    new Set()
  );
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Mock credit history data matching Prisma Credit model
  const getCreditHistory = (customerId: string): CreditHistory[] => {
    const mockCredits: CreditHistory[] = [
      {
        id: "credit-1",
        transactionDate: "2024-01-15T14:30:00Z",
        transactionType: "credit_given",
        amount: 250.75,
        description: "Store purchase - groceries and household items",
        itemsDescription: "Milk, bread, detergent, rice (5kg)",
        journalNumber: "JRN-2024-001",
        referenceNumber: "REF-CG-001",
      },
      {
        id: "credit-2",
        transactionDate: "2024-01-10T09:15:00Z",
        transactionType: "payment_received",
        amount: 100.0,
        description: "Partial payment via mobile money",
        itemsDescription: undefined,
        journalNumber: "JRN-2024-002",
        referenceNumber: "REF-PR-002",
      },
      {
        id: "credit-3",
        transactionDate: "2024-01-05T16:45:00Z",
        transactionType: "credit_given",
        amount: 89.5,
        description: "Hardware supplies",
        itemsDescription: "Nails (2kg), hammer, screws, paint brush",
        journalNumber: "JRN-2024-003",
        referenceNumber: "REF-CG-003",
      },
    ];

    const moreCredits: CreditHistory[] = [
      {
        id: "credit-4",
        transactionDate: "2024-01-20T11:20:00Z",
        transactionType: "payment_received",
        amount: 150.0,
        description: "Cash payment",
        itemsDescription: undefined,
        journalNumber: "JRN-2024-004",
        referenceNumber: "REF-PR-004",
      },
      {
        id: "credit-5",
        transactionDate: "2024-01-22T13:45:00Z",
        transactionType: "credit_given",
        amount: 320.0,
        description: "Electronics purchase",
        itemsDescription: "Phone charger, earphones, power bank",
        journalNumber: "JRN-2024-005",
        referenceNumber: "REF-CG-005",
      },
      {
        id: "credit-6",
        transactionDate: "2024-01-25T10:30:00Z",
        transactionType: "payment_received",
        amount: 75.0,
        description: "Mobile money payment",
        itemsDescription: undefined,
        journalNumber: "JRN-2024-006",
        referenceNumber: "REF-PR-006",
      },
    ];

    const allCredits = [...mockCredits, ...moreCredits];

    const customerCredits: { [key: string]: CreditHistory[] } = {
      "1": mockCredits.slice(0, 3),
      "2": mockCredits.slice(1, 3),
      "3": [mockCredits[0], mockCredits[2]],
      "4": mockCredits,
      "5": mockCredits.slice(0, 2),
      "6": [allCredits[3], allCredits[4]],
      "7": [allCredits[1], allCredits[5]],
      "8": [allCredits[0], allCredits[4], allCredits[5]],
      "9": [allCredits[2], allCredits[3]],
      "10": allCredits.slice(0, 4),
      "11": [allCredits[1], allCredits[4]],
      "12": [allCredits[0], allCredits[3], allCredits[5]],
      "13": [allCredits[2], allCredits[5]],
      "14": [allCredits[1], allCredits[3]],
      "15": [allCredits[0], allCredits[2], allCredits[4]],
    };

    return customerCredits[customerId] || mockCredits.slice(0, 2);
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6
      )}`;
    }
    return phone;
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const getOutstandingBalance = (customerId: string): number => {
    const mockBalances: { [key: string]: number } = {
      "1": 250.75,
      "2": 0,
      "3": 145.3,
      "4": 890.25,
      "5": 67.8,
      "6": 320.0,
      "7": 0,
      "8": 175.5,
      "9": 89.5,
      "10": 450.75,
      "11": 0,
      "12": 225.0,
      "13": 75.0,
      "14": 0,
      "15": 395.25,
    };
    return mockBalances[customerId] || 0;
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await MockCustomerService.getCustomers({
          storeId: "mock-store-id",
          page: 1,
          limit: 20, // Increased to show all customers
        });
        setCustomers(response.customers);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const toggleRowExpansion = (customerId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(customerId)) {
      newExpanded.delete(customerId);
    } else {
      newExpanded.add(customerId);
    }
    setExpandedRows(newExpanded);
  };

  const toggleCustomerSelection = (customerId: string) => {
    const newSelected = new Set(selectedCustomers);
    if (newSelected.has(customerId)) {
      newSelected.delete(customerId);
    } else {
      newSelected.add(customerId);
    }
    setSelectedCustomers(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedCustomers.size === customers.length) {
      setSelectedCustomers(new Set());
    } else {
      setSelectedCustomers(new Set(customers.map((c) => c.id)));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedCustomers.size > 0 && onCustomerDelete) {
      onCustomerDelete(Array.from(selectedCustomers));
      setSelectedCustomers(new Set());
    }
  };

  const getTransactionTypeColor = (
    transactionType: "credit_given" | "payment_received"
  ) => {
    switch (transactionType) {
      case "credit_given":
        return "#d32f2f";
      case "payment_received":
        return "#2e7d32";
      default:
        return "#666";
    }
  };

  if (loading) {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.loadingText}>Loading customers...</Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Customer Management Table</Text>
          </View>

          {selectedCustomers.size > 0 && (
            <View style={styles.selectionActions}>
              <Text style={styles.selectedCount}>
                {selectedCustomers.size} customer(s) selected
              </Text>
              <Button
                mode="contained"
                onPress={handleDeleteSelected}
                buttonColor="#f44336"
                textColor="#fff"
                icon="delete"
                compact
              >
                Delete Selected
              </Button>
            </View>
          )}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            persistentScrollbar={true}
            style={styles.tableScroll}
            contentContainerStyle={{ paddingLeft: 4, paddingRight: 20 }}
          >
            <View style={styles.tableContainer}>
              <DataTable>
                <DataTable.Header style={styles.tableHeader}>
                  {/* Checkbox Column */}
                  <DataTable.Title
                    style={styles.checkboxColumn}
                    numeric={false}
                  >
                    <View style={styles.headerCheckbox}>
                      <Checkbox
                        status={
                          selectedCustomers.size === customers.length
                            ? "checked"
                            : selectedCustomers.size > 0
                            ? "indeterminate"
                            : "unchecked"
                        }
                        onPress={toggleSelectAll}
                      />
                    </View>
                  </DataTable.Title>

                  {/* Actions Column */}
                  <DataTable.Title style={styles.actionColumn}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Text style={styles.headerText}>Actions</Text>
                    </View>
                  </DataTable.Title>

                  {/* Name Column */}
                  <DataTable.Title style={styles.nameColumn}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start', height: '100%' }}>
                      <Text style={styles.headerText}>Name</Text>
                    </View>
                  </DataTable.Title>

                  {/* Phone Column */}
                  <DataTable.Title style={styles.phoneColumn}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start', height: '100%' }}>
                      <Text style={styles.headerText}>Phone</Text>
                    </View>
                  </DataTable.Title>

                  {/* CID Number Column */}
                  <DataTable.Title style={styles.cidColumn}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start', height: '100%' }}>
                      <Text style={styles.headerText}>CID</Text>
                    </View>
                  </DataTable.Title>

                  {/* Email Column */}
                  <DataTable.Title style={styles.emailColumn}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start', height: '100%' }}>
                      <Text style={styles.headerText}>Email</Text>
                    </View>
                  </DataTable.Title>

                  {/* Address Column */}
                  <DataTable.Title style={styles.addressColumn}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start', height: '100%' }}>
                      <Text style={styles.headerText}>Address</Text>
                    </View>
                  </DataTable.Title>

                  {/* Credit Limit Column */}
                  <DataTable.Title style={styles.creditColumn}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-end', height: '100%' }}>
                      <Text style={styles.headerText}>Credit Limit</Text>
                    </View>
                  </DataTable.Title>

                  {/* Outstanding Balance Column */}
                  <DataTable.Title style={styles.balanceColumn}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-end', height: '100%' }}>
                      <Text style={styles.headerText}>Outstanding</Text>
                    </View>
                  </DataTable.Title>

                  {/* Status Column */}
                  <DataTable.Title style={styles.statusColumn}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Text style={styles.headerText}>Status</Text>
                    </View>
                  </DataTable.Title>
                </DataTable.Header>

                {customers.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No customers found</Text>
                  </View>
                ) : (
                  customers.map((customer) => (
                    <View key={customer.id}>
                      <DataTable.Row
                        style={
                          selectedCustomers.has(customer.id)
                            ? styles.selectedRow
                            : styles.normalRow
                        }
                      >
                        {/* Checkbox Cell */}
                        <DataTable.Cell style={styles.checkboxColumn}>
                          <View style={styles.cellCheckbox}>
                            <Checkbox
                              status={
                                selectedCustomers.has(customer.id)
                                  ? "checked"
                                  : "unchecked"
                              }
                              onPress={() =>
                                toggleCustomerSelection(customer.id)
                              }
                            />
                          </View>
                        </DataTable.Cell>

                        {/* Actions Cell */}
                        <DataTable.Cell style={styles.actionColumn}>
                          <IconButton
                            icon={
                              expandedRows.has(customer.id)
                                ? "chevron-up"
                                : "chevron-down"
                            }
                            size={20}
                            onPress={() => toggleRowExpansion(customer.id)}
                          />
                        </DataTable.Cell>

                        {/* Name Cell */}
                        <DataTable.Cell style={styles.nameColumn}>
                          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start', paddingVertical: 8 }}>
                            <Text style={[styles.cellText, { fontWeight: '500' }]} numberOfLines={1}>
                              {customer.name}
                            </Text>
                          </View>
                        </DataTable.Cell>

                        {/* Phone Cell */}
                        <DataTable.Cell style={styles.phoneColumn}>
                          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start', paddingVertical: 8 }}>
                            <Text style={[styles.cellText, { fontFamily: 'monospace' }]}>
                              {formatPhoneNumber(customer.phoneNumber)}
                            </Text>
                          </View>
                        </DataTable.Cell>

                        {/* CID Cell */}
                        <DataTable.Cell style={styles.cidColumn}>
                          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start', paddingVertical: 8 }}>
                            <Text style={[styles.cellText, { fontFamily: 'monospace' }]}>
                              {customer.cidNumber || "N/A"}
                            </Text>
                          </View>
                        </DataTable.Cell>

                        {/* Email Cell */}
                        <DataTable.Cell style={styles.emailColumn}>
                          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start', paddingVertical: 8 }}>
                            <Text style={styles.cellText} numberOfLines={1} ellipsizeMode="tail">
                              {customer.email || "N/A"}
                            </Text>
                          </View>
                        </DataTable.Cell>

                        {/* Address Cell */}
                        <DataTable.Cell style={styles.addressColumn}>
                          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start', paddingVertical: 8 }}>
                            <Text style={styles.cellText} numberOfLines={1} ellipsizeMode="tail">
                              {customer.address || "N/A"}
                            </Text>
                          </View>
                        </DataTable.Cell>

                        {/* Credit Limit Cell */}
                        <DataTable.Cell style={styles.creditColumn}>
                          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-end', paddingVertical: 8 }}>
                            <Text style={[styles.cellText, styles.creditAmount]}>
                              {formatCurrency(customer.creditLimit || 0)}
                            </Text>
                          </View>
                        </DataTable.Cell>

                        {/* Outstanding Balance Cell */}
                        <DataTable.Cell style={styles.balanceColumn}>
                          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-end', paddingVertical: 8 }}>
                            <Text
                              style={[
                                styles.cellText,
                                {
                                  color:
                                    getOutstandingBalance(customer.id) > 0
                                      ? "#FF8C00"
                                      : "#1E88E5",
                                  fontWeight: "700",
                                  fontFamily: 'monospace',
                                },
                              ]}
                            >
                              {formatCurrency(getOutstandingBalance(customer.id))}
                            </Text>
                          </View>
                        </DataTable.Cell>

                        {/* Status Cell */}
                        <DataTable.Cell style={styles.statusColumn}>
                          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 8 }}>
                            <Chip
                              mode="flat"
                              compact={true}
                              style={{
                                backgroundColor:
                                  customer.isActive !== false
                                    ? "#e3f2fd"
                                    : "#fff3e0",
                              }}
                              textStyle={{
                                color:
                                  customer.isActive !== false
                                    ? "#1E88E5"
                                    : "#FF8C00",
                                fontSize: 12,
                                fontWeight: '600',
                              }}
                            >
                              {customer.isActive !== false
                                ? "Active"
                                : "Inactive"}
                            </Chip>
                          </View>
                        </DataTable.Cell>
                      </DataTable.Row>

                      {/* Expandable Credit History Section */}
                      {expandedRows.has(customer.id) && (
                        <View style={styles.expandedSection}>
                          <Surface style={styles.expandedContent}>
                            <Text style={styles.historyTitle}>
                              Credit History for {customer.name}
                            </Text>

                            {/* Credit History DataTable */}
                            <DataTable style={styles.historyTable}>
                              <DataTable.Header
                                style={styles.historyTableHeader}
                              >
                                <DataTable.Title
                                  style={styles.historyDateColumn}
                                >
                                  <Text style={styles.historyHeaderText}>
                                    Date
                                  </Text>
                                </DataTable.Title>
                                <DataTable.Title
                                  style={styles.historyTypeColumn}
                                >
                                  <Text style={styles.historyHeaderText}>
                                    Type
                                  </Text>
                                </DataTable.Title>
                                <DataTable.Title
                                  style={styles.historyAmountColumn}
                                >
                                  <Text style={styles.historyHeaderText}>
                                    Amount
                                  </Text>
                                </DataTable.Title>
                                <DataTable.Title
                                  style={styles.historyDescColumn}
                                >
                                  <Text style={styles.historyHeaderText}>
                                    Description
                                  </Text>
                                </DataTable.Title>
                                <DataTable.Title
                                  style={styles.historyItemsColumn}
                                >
                                  <Text style={styles.historyHeaderText}>
                                    Items
                                  </Text>
                                </DataTable.Title>
                                <DataTable.Title
                                  style={styles.historyRefColumn}
                                >
                                  <Text style={styles.historyHeaderText}>
                                    Reference
                                  </Text>
                                </DataTable.Title>
                              </DataTable.Header>

                              {getCreditHistory(customer.id).map((history) => (
                                <DataTable.Row
                                  key={history.id}
                                  style={styles.historyRow}
                                >
                                  <DataTable.Cell
                                    style={styles.historyDateColumn}
                                  >
                                    <Text style={styles.historyCellText}>
                                      {new Date(
                                        history.transactionDate
                                      ).toLocaleDateString()}
                                    </Text>
                                  </DataTable.Cell>

                                  <DataTable.Cell
                                    style={styles.historyTypeColumn}
                                  >
                                    <View style={{ justifyContent: 'center', alignItems: 'flex-start' }}>
                                      <Text
                                        style={{
                                          color: getTransactionTypeColor(
                                            history.transactionType
                                          ),
                                          fontSize: 11,
                                          fontWeight: "700",
                                          textTransform: "uppercase",
                                          letterSpacing: 0.5,
                                        }}
                                      >
                                        {history.transactionType
                                          .replace("_", " ")
                                          .toUpperCase()}
                                      </Text>
                                    </View>
                                  </DataTable.Cell>

                                  <DataTable.Cell
                                    style={styles.historyAmountColumn}
                                  >
                                    <Text
                                      style={[
                                        styles.historyCellText,
                                        {
                                          color: getTransactionTypeColor(
                                            history.transactionType
                                          ),
                                          fontWeight: "600",
                                          fontFamily: "monospace",
                                        },
                                      ]}
                                    >
                                      {formatCurrency(history.amount)}
                                    </Text>
                                  </DataTable.Cell>

                                  <DataTable.Cell
                                    style={styles.historyDescColumn}
                                  >
                                    <Text
                                      style={styles.historyCellText}
                                      numberOfLines={2}
                                    >
                                      {history.description || "N/A"}
                                    </Text>
                                  </DataTable.Cell>

                                  <DataTable.Cell
                                    style={styles.historyItemsColumn}
                                  >
                                    <Text
                                      style={styles.historyCellText}
                                      numberOfLines={2}
                                    >
                                      {history.itemsDescription || "N/A"}
                                    </Text>
                                  </DataTable.Cell>

                                  <DataTable.Cell
                                    style={styles.historyRefColumn}
                                  >
                                    <Text style={styles.historyCellText}>
                                      {history.journalNumber &&
                                        `J: ${history.journalNumber}`}
                                      {history.journalNumber &&
                                        history.referenceNumber &&
                                        "\n"}
                                      {history.referenceNumber &&
                                        `R: ${history.referenceNumber}`}
                                    </Text>
                                  </DataTable.Cell>
                                </DataTable.Row>
                              ))}
                            </DataTable>
                          </Surface>
                        </View>
                      )}
                    </View>
                  ))
                )}
              </DataTable>
            </View>
          </ScrollView>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  card: {
    margin: 12,
    marginLeft: 16,
    marginRight: 16,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 16,
    fontStyle: "italic",
  },
  loadingText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    padding: 20,
  },
  selectionActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  selectedCount: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  tableScroll: {
    width: "100%",
  },
  tableContainer: {
    width: 1800,
    minWidth: 1800,
  },
  tableHeader: {
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 2,
    borderBottomColor: "#e0e0e0",
    height: 64,
    alignItems: "center",
  },
  headerText: {
    fontWeight: "700",
    fontSize: 14,
    color: "#424242",
  },
  cellText: {
    fontSize: 14,
    color: "#424242",
    lineHeight: 20,
  },
  creditAmount: {
    fontWeight: "600",
    color: "#2e7d32",
    fontFamily: "monospace",
  },
  selectedRow: {
    backgroundColor: "#e3f2fd",
    minHeight: 64,
    alignItems: "center",
  },
  normalRow: {
    backgroundColor: "transparent",
    minHeight: 64,
    alignItems: "center",
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    color: "#666",
    fontSize: 16,
  },

  // Column widths - Full horizontal layout (Total: 1800px)
  checkboxColumn: {
    width: 70,
    minWidth: 70,
    maxWidth: 70,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  actionColumn: {
    width: 90,
    minWidth: 90,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  nameColumn: {
    width: 180,
    minWidth: 180,
    paddingHorizontal: 12,
    justifyContent: "flex-start",
  },
  phoneColumn: {
    width: 160,
    minWidth: 160,
    paddingHorizontal: 12,
    justifyContent: "flex-start",
  },
  cidColumn: {
    width: 120,
    minWidth: 120,
    paddingHorizontal: 12,
    justifyContent: "flex-start",
  },
  emailColumn: {
    width: 250,
    minWidth: 250,
    paddingHorizontal: 12,
    justifyContent: "flex-start",
  },
  addressColumn: {
    width: 280,
    minWidth: 280,
    paddingHorizontal: 12,
    justifyContent: "flex-start",
  },
  creditColumn: {
    width: 150,
    minWidth: 150,
    paddingHorizontal: 12,
    justifyContent: "flex-end",
  },
  balanceColumn: {
    width: 160,
    minWidth: 160,
    paddingHorizontal: 12,
    justifyContent: "flex-end",
  },
  statusColumn: {
    width: 140,
    minWidth: 140,
    paddingHorizontal: 12,
    justifyContent: "center",
  },

  // Checkbox styling
  headerCheckbox: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 64,
    flex: 1,
  },
  cellCheckbox: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 64,
    flex: 1,
    marginLeft: 4,
  },

  // Expanded content styling
  expandedSection: {
    backgroundColor: "#fafafa",
    marginHorizontal: 16,
    marginBottom: 8,
  },
  expandedContent: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    elevation: 1,
    borderLeftWidth: 4,
    borderLeftColor: "#2196f3",
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  historyContainer: {
    gap: 8,
  },
  historyCard: {
    marginBottom: 8,
    elevation: 1,
    backgroundColor: "#fafafa",
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 12,
    color: "#666",
    fontFamily: "monospace",
    fontWeight: "500",
  },
  historyAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    fontFamily: "monospace",
    marginBottom: 6,
  },
  historyDescription: {
    fontSize: 13,
    color: "#424242",
    marginBottom: 4,
    lineHeight: 18,
  },
  historyItems: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    marginBottom: 6,
    lineHeight: 16,
  },
  historyMeta: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  historyMetaText: {
    fontSize: 10,
    color: "#757575",
    fontFamily: "monospace",
  },

  // Credit History Table Styles
  historyTable: {
    backgroundColor: "#fff",
    marginTop: 8,
    borderRadius: 4,
    elevation: 1,
  },
  historyTableHeader: {
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 2,
    borderBottomColor: "#e0e0e0",
  },
  historyHeaderText: {
    fontWeight: "700",
    fontSize: 12,
    color: "#424242",
  },
  historyCellText: {
    fontSize: 12,
    color: "#616161",
  },
  historyRow: {
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  // History table column widths
  historyDateColumn: {
    width: 100,
    minWidth: 100,
  },
  historyTypeColumn: {
    width: 140,
    minWidth: 140,
  },
  historyAmountColumn: {
    width: 120,
    minWidth: 120,
  },
  historyDescColumn: {
    width: 200,
    minWidth: 200,
  },
  historyItemsColumn: {
    width: 200,
    minWidth: 200,
  },
  historyRefColumn: {
    width: 150,
    minWidth: 150,
  },
});
