import React, { useState, useEffect } from "react";
import { StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { View } from "react-native";
import { Card, Text, Searchbar, Divider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { MockCustomerService } from "../../lib/mock-customer-service";
import FixedCustomerTables from "@/components/FixedCustomerTables";

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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const addNewCustomer = () => {
    // Navigate to modal for now
    router.push("/modal");
  };

  // Fetch customers for overview stats
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await MockCustomerService.getCustomers({
          storeId: "mock-store-id",
          page: 1,
          limit: 100, // Get all customers for accurate count
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
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ flex: 1 }}>
        {/* Quick Actions */}
        <Card style={{ margin: 16, elevation: 2 }}>
          <Card.Content>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 16,
                color: "#333",
              }}
            >
              Quick Actions
            </Text>

            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <TouchableOpacity
                style={{
                  alignItems: "center",
                  padding: 24,
                  backgroundColor: "#e3f2fd",
                  borderRadius: 12,
                  minWidth: 150,
                }}
                onPress={addNewCustomer}
              >
                <MaterialIcons name="person-add" size={36} color="#1976d2" />
                <Text
                  style={{
                    marginTop: 8,
                    color: "#1976d2",
                    fontWeight: "500",
                    fontSize: 16,
                  }}
                >
                  Add Customer
                </Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

        {/* Stats Overview */}
        <Card style={{ margin: 16, elevation: 2 }}>
          <Card.Content>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 16,
                color: "#333",
              }}
            >
              Overview
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

        {/* Customer Management Table */}
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
});
