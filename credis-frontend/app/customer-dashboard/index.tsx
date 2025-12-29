import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Platform,
} from "react-native";
import { Card, Text, Searchbar } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import ResponsiveCustomerTable from "@/components/ResponsiveCustomerTable";

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

import { router } from "expo-router";

export default function CustomersScreen() {
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading]);
  const [searchQuery, setSearchQuery] = useState("");
  const [shopName, setShopName] = useState("My Shop");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [outstandingBalance, setOutstandingBalance] = useState<number | null>(
    null
  );
  const { width } = useWindowDimensions();

  // Get storeId from user context
  const storeId = user?.storeId;

  // Responsive breakpoints
  const isSmallScreen = width < 768;

  // Fetch store and customers using storeId from user
  useEffect(() => {
    if (!storeId) return;
    const fetchStoreData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:8080/api/stores/${storeId}/customers`
        );
        const data = await response.json();
        if (data.success && data.data) {
          setShopName(data.data.name || "My Shop");
          setCustomers(data.data.customers || []);
        }
      } catch (error) {
        console.error("Failed to fetch store data:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchOutstandingBalance = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/credits/store/${storeId}/outstanding`
        );
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          const total = data.data.reduce(
            (sum: number, customer: { outstandingBalance?: number }) => {
              return (
                sum +
                (typeof customer.outstandingBalance === "number"
                  ? customer.outstandingBalance
                  : 0)
              );
            },
            0
          );
          setOutstandingBalance(total);
        } else {
          setOutstandingBalance(null);
        }
      } catch (error) {
        console.error("Failed to fetch outstanding balance:", error);
        setOutstandingBalance(null);
      }
    };

    fetchStoreData();
    fetchOutstandingBalance();
  }, [storeId]);

  const addNewCustomer = () => {
    router.push({
      pathname: "/customer-dashboard/components/modal",
      params: { storeId },
    } as any);
  };

  // Responsive card margin and padding
  const cardMargin = isSmallScreen ? 12 : 16;
  const cardPadding = isSmallScreen ? 16 : 20;

  if (isLoading) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text>Checking authentication...</Text>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { padding: cardMargin }]}
      >
        <View style={styles.headerContent}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{shopName}</Text>
            <Text style={styles.headerSubtitle}>
              Manage and track your customer database
            </Text>
            <View style={{ marginTop: 8 }}>
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
                Total Outstanding Balance:
                <Text style={{ color: "#ffd700", fontWeight: "bold" }}>
                  {outstandingBalance !== null
                    ? ` Nu. ${outstandingBalance.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}`
                    : " Loading..."}
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Sticky Search Bar and Add Button Section */}
      <View style={[styles.stickyNavBar, { paddingHorizontal: cardMargin }]}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Searchbar
            placeholder="Search by name, phone, email, or CID..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            icon="magnify"
            iconColor="#667eea"
            elevation={4}
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={addNewCustomer}
          activeOpacity={0.8}
        >
          <MaterialIcons name="add" size={24} color="#fff" />
          {!isSmallScreen && (
            <Text style={styles.addButtonText}>Add Customer</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Customer Management Table */}
        <View
          style={{
            marginHorizontal: cardMargin,
            marginTop: 24,
            marginBottom: 24,
          }}
        >
          <Card style={styles.tableCard}>
            <Card.Content style={{ padding: isSmallScreen ? 12 : 20 }}>
              <View style={styles.tableHeader}>
                <View style={styles.tableHeaderLeft}>
                  <MaterialIcons name="table-chart" size={24} color="#667eea" />
                  <Text style={styles.sectionTitle}>Customer Directory</Text>
                </View>
              </View>

              <ResponsiveCustomerTable
                searchQuery={searchQuery}
                customers={customers}
                loading={loading}
                onCustomerDelete={(customerIds: string[]) => {
                  console.log("Delete customers:", customerIds);
                }}
              />
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  header: {
    paddingVertical: 24,
    paddingTop: Platform.OS === "ios" ? 0 : 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  stickyNavBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#f5f7fa",
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  addButton: {
    backgroundColor: "#667eea",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#667eea",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  searchBar: {
    borderRadius: 12,
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#667eea",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  searchInput: {
    fontSize: 16,
    color: "#333",
  },
  tableCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#f0f0f0",
  },
  tableHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    letterSpacing: 0.3,
  },
  badge: {
    backgroundColor: "#eef2ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d4d4f7",
  },
  badgeText: {
    color: "#667eea",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
