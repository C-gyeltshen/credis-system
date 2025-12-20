import React, { useState, useEffect } from "react";
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
import { router } from "expo-router";
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

export default function CustomersScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [shopName, setShopName] = useState("My Shop");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { width } = useWindowDimensions();

  const STORE_ID = "fc8516c1-5068-4be9-8025-ed99d2890692";

  // Responsive breakpoints
  const isSmallScreen = width < 768;

  // Fetch store and customers
  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:8080/api/stores/${STORE_ID}/customers`
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
    fetchStoreData();
  }, []);

  const addNewCustomer = () => {
    router.push("/customer-dashboard/components/modal" as any);
  };

  // Responsive card margin and padding
  const cardMargin = isSmallScreen ? 12 : 16;
  const cardPadding = isSmallScreen ? 16 : 20;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
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
        </LinearGradient>

        {/* Search Bar */}
        <View
          style={{
            paddingHorizontal: cardMargin,
            marginBottom: 16,
            marginTop: 24,
          }}
        >
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

        {/* Customer Management Table */}
        <View style={{ marginHorizontal: cardMargin, marginBottom: 24 }}>
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
  addButton: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
  },
  card: {
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
  searchBar: {
    borderRadius: 16,
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
