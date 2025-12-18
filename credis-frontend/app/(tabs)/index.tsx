import React, { useState, useEffect } from "react";
import { View, ScrollView } from "react-native";
import {
  Card,
  Text,
  Button,
  Divider,
  Searchbar,
  Appbar,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* App Header */}
      <Appbar.Header
        style={{
          backgroundColor: "#1565C0",
          elevation: 6,
          shadowColor: "#1565C0",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        }}
      >
        <Appbar.Content
          title="CREDIS Dashboard"
          titleStyle={{
            fontSize: 22,
            fontWeight: "800",
            color: "#fff",
            letterSpacing: 1,
          }}
        />
      </Appbar.Header>

      <ScrollView style={{ flex: 1 }}>
        {/* Welcome Section */}
        <View
          style={{
            paddingTop: 24,
            paddingBottom: 32,
            paddingHorizontal: 24,
            backgroundColor: "#FFFFFF",
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontSize: 32,
              fontWeight: "800",
              color: "#1565C0",
              textAlign: "center",
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            Welcome!
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#42A5F5",
              textAlign: "center",
              fontWeight: "500",
              opacity: 0.8,
            }}
          >
            Manage your customer credits efficiently
          </Text>
        </View>

        {/* Add Customer Button */}
        <View
          style={{
            paddingHorizontal: 24,
            paddingVertical: 8,
            alignItems: "center",
          }}
        >
          <Button
            mode="contained"
            onPress={addNewCustomer}
            icon="account-plus"
            buttonColor="#FF8C00"
            textColor="#fff"
            contentStyle={{
              paddingVertical: 18,
              paddingHorizontal: 40,
              flexDirection: "row",
            }}
            style={{
              borderRadius: 16,
              elevation: 6,
              shadowColor: "#FF8C00",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              minWidth: 220,
            }}
            labelStyle={{
              fontSize: 18,
              fontWeight: "700",
              letterSpacing: 0.5,
            }}
          >
            Add New Customer
          </Button>
        </View>

        {/* Stats Overview */}
        <Card
          style={{
            margin: 20,
            marginTop: 24,
            elevation: 4,
            borderRadius: 16,
            backgroundColor: "#FFFFFF",
          }}
        >
          <Card.Content style={{ padding: 20 }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                marginBottom: 20,
                color: "#1565C0",
                textAlign: "center",
                letterSpacing: 0.5,
              }}
            >
              Business Overview
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <View style={{ alignItems: "center", flex: 1 }}>
                <Text
                  style={{ fontSize: 24, fontWeight: "bold", color: "#6200ee" }}
                >
                  {customers.length}
                </Text>
                <Text style={{ color: "#666", fontSize: 12 }}>
                  Total Customers
                </Text>
              </View>
              <Divider style={{ width: 1, height: 40 }} />
              <View style={{ alignItems: "center", flex: 1 }}>
                <Text
                  style={{ fontSize: 24, fontWeight: "bold", color: "#ff6f00" }}
                >
                  {
                    customers.filter((customer) => customer.isActive !== false)
                      .length
                  }
                </Text>
                <Text style={{ color: "#666", fontSize: 12 }}>
                  Active Records
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Search Bar */}
        <View style={{ padding: 16 }}>
          <Searchbar
            placeholder="Search customers..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{ elevation: 2 }}
            icon="magnify"
          />
        </View>

        {/* Advanced Customer Tables */}
        <View style={{ paddingBottom: 20 }}>
          <FixedCustomerTables
            onCustomerDelete={(customerIds: string[]) => {
              console.log("Delete customers:", customerIds);
              // Here you would implement actual deletion logic
              // For now, just refresh the customers list
              setCustomers((prev) =>
                prev.filter((c) => !customerIds.includes(c.id))
              );
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
