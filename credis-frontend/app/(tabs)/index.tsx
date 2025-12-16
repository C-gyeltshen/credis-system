import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import {
  Card,
  Text,
  Button,
  Avatar,
  Divider,
  Searchbar,
  Appbar,
  DataTable,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { router } from "expo-router";
import { MockCustomerService } from "../../lib/mock-customer-service";
import FixedCustomerTables from "../../components/FixedCustomerTables";

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

export default function HomeScreen() {
  const { user, logout, login } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Get screen dimensions for responsive design
  const { width: screenWidth } = Dimensions.get("window");
  const isTablet = screenWidth > 768;
  const isMobile = screenWidth <= 480;

  const handleLogout = async () => {
    await logout();
    // For now, we'll handle logout by showing an alert
    // In a complete app, you'd redirect to a login screen
  };

  const addNewCustomer = () => {
    // Navigate to modal for now
    router.push("/modal");
  };

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    // Remove any non-numeric characters
    const cleaned = phone.replace(/\D/g, "");

    // Format as (XXX) XXX-XXXX if 10 digits
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6
      )}`;
    }

    // Return original if not 10 digits
    return phone;
  };

  // Fetch recent customers for the table
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await MockCustomerService.getCustomers({
          storeId: "mock-store-id",
          page: 1,
          limit: 5, // Show only 5 most recent customers
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

  // If not authenticated, show login prompt
  if (!user) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
          backgroundColor: "#f5f5f5",
        }}
      >
        <Card style={{ width: "100%", maxWidth: 400, elevation: 4 }}>
          <Card.Content style={{ padding: 24, alignItems: "center" }}>
            <MaterialIcons name="account-circle" size={64} color="#6200ee" />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                marginTop: 16,
                marginBottom: 8,
              }}
            >
              Authentication Required
            </Text>
            <Text
              style={{ textAlign: "center", color: "#666", marginBottom: 24 }}
            >
              Please sign in to access your customer management dashboard
            </Text>
            <Button
              mode="contained"
              onPress={async () => {
                // Mock login for demo
                await login("demo@example.com", "password123");
              }}
              style={{ width: "100%" }}
            >
              Demo Login
            </Button>
          </Card.Content>
        </Card>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFB" }}>
      {/* Header Section with Title and Logout */}
      <View
        style={{
          paddingHorizontal: isMobile ? 16 : 24,
          paddingVertical: 20,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
            <Image
              source={require("../../logo.jpg")}
              style={{
                width: isTablet ? 50 : isMobile ? 35 : 40,
                height: isTablet ? 50 : isMobile ? 35 : 40,
                marginRight: 12,
              }}
              resizeMode="contain"
            />
            <View>
              <Text
                style={{
                  fontSize: isTablet ? 28 : isMobile ? 20 : 24,
                  fontWeight: "800",
                  color: "#1F2937",
                  letterSpacing: 0.5,
                }}
              >
                CREDIS
              </Text>
              <Text
                style={{
                  fontSize: isTablet ? 16 : 14,
                  color: "#6B7280",
                  fontWeight: "500",
                  marginTop: 2,
                }}
              >
                Customer Credit Management
              </Text>
            </View>
          </View>

          <Button
            mode="contained"
            onPress={handleLogout}
            buttonColor="#EF4444"
            textColor="#FFFFFF"
            style={{
              borderRadius: 12,
              elevation: 2,
            }}
            contentStyle={{
              paddingHorizontal: isMobile ? 12 : 16,
              paddingVertical: 8,
            }}
            labelStyle={{
              fontSize: isMobile ? 13 : 14,
              fontWeight: "600",
            }}
          >
            Logout
          </Button>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View
          style={{
            paddingHorizontal: isMobile ? 16 : 24,
            paddingTop: 32,
            paddingBottom: 24,
          }}
        >
          <Text
            style={{
              fontSize: isTablet ? 36 : isMobile ? 28 : 32,
              fontWeight: "700",
              color: "#1565C0",
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            Welcome Back!
          </Text>
          <Text
            style={{
              fontSize: isTablet ? 18 : 16,
              color: "#64748B",
              textAlign: "center",
              fontWeight: "500",
              lineHeight: 24,
            }}
          >
            Manage your customer credits and track business performance
          </Text>
        </View>

        {/* Main Actions */}
        <View
          style={{
            paddingHorizontal: isMobile ? 16 : 24,
            marginBottom: 24,
          }}
        >
          <Button
            mode="contained"
            onPress={addNewCustomer}
            icon="plus"
            buttonColor="#FF8C00"
            textColor="#FFFFFF"
            contentStyle={{
              paddingVertical: isTablet ? 20 : 16,
              paddingHorizontal: isTablet ? 48 : 32,
            }}
            style={{
              borderRadius: 16,
              elevation: 6,
              shadowColor: "#FF8C00",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              width: "100%",
            }}
            labelStyle={{
              fontSize: isTablet ? 20 : 18,
              fontWeight: "700",
              letterSpacing: 0.5,
            }}
          >
            Add New Customer
          </Button>
        </View>

        {/* Stats Dashboard */}
        <View
          style={{
            paddingHorizontal: isMobile ? 16 : 24,
            marginBottom: 24,
          }}
        >
          <Card
            style={{
              borderRadius: 20,
              elevation: 4,
              backgroundColor: "#FFFFFF",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
            }}
          >
            <Card.Content
              style={{
                padding: isTablet ? 28 : 20,
              }}
            >
              <Text
                style={{
                  fontSize: isTablet ? 24 : 20,
                  fontWeight: "700",
                  color: "#1F2937",
                  textAlign: "center",
                  marginBottom: 24,
                  letterSpacing: 0.5,
                }}
              >
                Business Overview
              </Text>

              <View
                style={{
                  flexDirection: isTablet ? "row" : "row",
                  justifyContent: "space-around",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    alignItems: "center",
                    flex: 1,
                    paddingVertical: 16,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#EBF5FF",
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: isTablet ? 32 : 28,
                        fontWeight: "800",
                        color: "#1565C0",
                      }}
                    >
                      {customers.length}
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: "#64748B",
                      fontSize: isTablet ? 16 : 14,
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >
                    Total Customers
                  </Text>
                </View>

                <Divider
                  style={{
                    width: 2,
                    height: 60,
                    backgroundColor: "#E5E7EB",
                  }}
                />

                <View
                  style={{
                    alignItems: "center",
                    flex: 1,
                    paddingVertical: 16,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#FFF7ED",
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: isTablet ? 32 : 28,
                        fontWeight: "800",
                        color: "#FF8C00",
                      }}
                    >
                      {
                        customers.filter(
                          (customer) => customer.isActive !== false
                        ).length
                      }
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: "#64748B",
                      fontSize: isTablet ? 16 : 14,
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >
                    Active Accounts
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Search Section */}
        <View
          style={{
            paddingHorizontal: isMobile ? 16 : 24,
            marginBottom: 24,
          }}
        >
          <Searchbar
            placeholder="Search customers by name, phone, or CID..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{
              elevation: 3,
              borderRadius: 16,
              backgroundColor: "#FFFFFF",
            }}
            inputStyle={{
              fontSize: isTablet ? 16 : 14,
            }}
            iconColor="#64748B"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Customer Tables */}
        <View
          style={{
            paddingHorizontal: isMobile ? 16 : 24,
            paddingBottom: 24,
          }}
        >
          <Card
            style={{
              borderRadius: 20,
              elevation: 4,
              backgroundColor: "#FFFFFF",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
            }}
          >
            <Card.Content style={{ padding: 0 }}>
              <FixedCustomerTables
                searchQuery={searchQuery}
                onCustomerDelete={(customerIds: string[]) => {
                  console.log("Delete customers:", customerIds);
                  setCustomers((prev) =>
                    prev.filter((c) => !customerIds.includes(c.id))
                  );
                }}
              />
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
