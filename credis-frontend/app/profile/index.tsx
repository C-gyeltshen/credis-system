import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Navigation from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { router } from "expo-router";

interface StoreOwnerResponse {
  id: string;
  name: string;
  accountNumber?: string;
  phone_number: string;
  storeId?: string | null;
  isActive: boolean;
  createdAt: Date;
}

interface FirstResponse {
  user: StoreOwnerResponse;
  success: boolean;
  createdAt: Date;
}

interface StoreResponse {
  id: string;
  name: string;
  phone_number: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FirstStoreResponse {
  createdAt: Date;
  data: StoreResponse;
  success: boolean;
  updatedAt: Date;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ProfilePage() {
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [storeOwner, setStoreOwner] = useState<FirstResponse | null>(null);
  const [store, setStore] = useState<FirstStoreResponse | null>(null);
  const [editedOwnerName, setEditedOwnerName] = useState("");
  const [editedOwnerEmail, setEditedOwnerEmail] = useState("");
  const [editedAccountNumber, setEditedAccountNumber] = useState("");
  const [editedStoreName, setEditedStoreName] = useState("");
  const [editedStorePhone, setEditedStorePhone] = useState("");
  const [editedStoreAddress, setEditedStoreAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isLoading, user } = useAuth();

  const ownerId = user?.id;
  const storeId = user?.storeId;

  const isSmallPhone = width < 360;
  const isPhone = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    if (ownerId) {
      fetchProfileData();
    }
  }, [ownerId, storeId]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch store owner data
      const ownerResponse = await fetch(
        `${API_BASE_URL}/store-owners/${ownerId}`
      );
      if (!ownerResponse.ok) {
        throw new Error("Failed to fetch store owner data");
      }
      const ownerData: FirstResponse = await ownerResponse.json();
      console.log(ownerData)
      ownerData.createdAt = new Date(ownerData.createdAt);

      setStoreOwner(ownerData);
      setEditedOwnerName(ownerData.user.name);
      setEditedAccountNumber(ownerData.user.accountNumber || "");
      // console.log("phoneNumber", ownerData.user.phoneNumber)

      // Fetch store data only if storeId exists
      if (storeId) {
        const storeResponse = await fetch(`${API_BASE_URL}/stores/${storeId}`);
        if (!storeResponse.ok) {
          throw new Error("Failed to fetch store data");
        }
        const storeData: FirstStoreResponse = await storeResponse.json();
        storeData.createdAt = new Date(storeData.createdAt);
        storeData.updatedAt = new Date(storeData.updatedAt);

        setStore(storeData);
        setEditedStoreName(storeData.data.name);
        setEditedStorePhone(storeData.data.phone_number);
      }

      setLoading(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error fetching profile:", err);
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      // Update store owner
      if (storeOwner) {
        const ownerUpdateResponse = await fetch(
          `${API_BASE_URL}/store-owners/${ownerId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: editedOwnerName,
              email: editedOwnerEmail,
              accountNumber: editedAccountNumber,
            }),
          }
        );
        if (!ownerUpdateResponse.ok) {
          throw new Error("Failed to update store owner");
        }

        // Update local state with new owner data
        const updatedOwner = {
          ...storeOwner,
          user: {
            ...storeOwner.user,
            name: editedOwnerName,
            email: editedOwnerEmail,
            accountNumber: editedAccountNumber,
          },
        };
        setStoreOwner(updatedOwner);
      }

      // Update store if it exists
      if (store && storeId) {
        const storeUpdateResponse = await fetch(
          `${API_BASE_URL}/stores/${storeId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: editedStoreName,
              address: editedStoreAddress,
              phone_number: editedStorePhone,
            }),
          }
        );
        if (!storeUpdateResponse.ok) {
          throw new Error("Failed to update store");
        }

        // Update local state with new store data
        const updatedStore = {
          ...store,
          data: {
            ...store.data,
            name: editedStoreName,
            address: editedStoreAddress,
            phone_number: editedStorePhone,
          },
        };
        setStore(updatedStore);
      }

      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      Alert.alert("Error", errorMessage);
      console.error("Error updating profile:", err);
    }
  };

  const handleCancel = () => {
    // Reset edited values to original
    if (storeOwner) {
      setEditedOwnerName(storeOwner.user.name);
      setEditedAccountNumber(storeOwner.user.accountNumber || "");
    }
    if (store) {
      setEditedStoreName(store.data.name);
      setEditedStorePhone(store.data.phone_number);
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <Navigation>
        <View style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1976d2" />
            <Text style={styles.loadingText}>Loading profile data...</Text>
          </View>
        </View>
      </Navigation>
    );
  }

  if (error || !storeOwner) {
    return (
      <Navigation>
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={48} color="#d32f2f" />
            <Text style={styles.errorText}>
              Error: {error || "No data available"}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchProfileData}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Navigation>
    );
  }

  return (
    <Navigation>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          isDesktop && styles.contentContainerDesktop,
        ]}
      >
        {/* Profile Header Section */}
        <View
          style={[styles.profileHeader, isPhone && styles.profileHeaderPhone]}
        >
          <View style={styles.profileHeaderContent}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImage}>
                <MaterialIcons
                  name="account-circle"
                  size={100}
                  color="#1976d2"
                />
              </View>
            </View>

            <View
              style={[styles.profileInfo, isPhone && styles.profileInfoPhone]}
            >
              <Text
                style={[
                  styles.ownerName,
                  isSmallPhone && styles.textSmall,
                  isTablet && styles.textLarge,
                ]}
              >
                {isEditing ? editedOwnerName : storeOwner.user.name}
              </Text>
              <Text style={[styles.ownerRole, isSmallPhone && styles.textTiny]}>
                Store Owner
              </Text>

              {isEditing ? (
                <View style={styles.editForm}>
                  <TextInput
                    style={styles.input}
                    placeholder="Name"
                    value={editedOwnerName}
                    onChangeText={setEditedOwnerName}
                    placeholderTextColor="#999"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={editedOwnerEmail}
                    onChangeText={setEditedOwnerEmail}
                    keyboardType="email-address"
                    placeholderTextColor="#999"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Account Number"
                    value={editedAccountNumber}
                    onChangeText={setEditedAccountNumber}
                    placeholderTextColor="#999"
                  />
                </View>
              ) : (
                <View style={styles.contactInfo}>
                  {storeOwner.user.accountNumber && (
                    <View style={styles.contactItem}>
                      <MaterialIcons
                        name="account-balance"
                        size={16}
                        color="#666"
                      />
                      <Text style={styles.contactText}>
                        {storeOwner.user.accountNumber}
                      </Text>
                    </View>
                  )}
                  <View style={styles.contactItem}>
                    <MaterialIcons
                      name="check-circle"
                      size={16}
                      color="#4caf50"
                    />
                    <Text style={styles.contactText}>
                      {storeOwner.user.isActive ? "Active" : "Inactive"}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Edit/Save/Cancel Buttons */}
          <View style={styles.buttonGroup}>
            {isEditing ? (
              <>
                <TouchableOpacity
                  style={[styles.editButton, styles.editButtonActive]}
                  onPress={handleSaveChanges}
                >
                  <MaterialIcons name="check" size={20} color="#fff" />
                  <Text style={styles.editButtonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.editButton, styles.cancelButton]}
                  onPress={handleCancel}
                >
                  <MaterialIcons name="close" size={20} color="#fff" />
                  <Text style={styles.editButtonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <MaterialIcons name="edit" size={20} color="#fff" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Store Details Section */}
        {store && (
          <View
            style={[
              styles.section,
              isDesktop && styles.sectionDesktop,
              isPhone && styles.sectionPhone,
            ]}
          >
            <View style={styles.sectionHeader}>
              <MaterialIcons name="store" size={24} color="#1976d2" />
              <Text
                style={[styles.sectionTitle, isSmallPhone && styles.textSmall]}
              >
                Store Information
              </Text>
            </View>

            <View
              style={[
                styles.detailsGrid,
                isDesktop && styles.detailsGridDesktop,
              ]}
            >
              {/* Store Name */}
              <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>Store Name</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={editedStoreName}
                    onChangeText={setEditedStoreName}
                    placeholderTextColor="#999"
                  />
                ) : (
                  <Text style={styles.detailValue}>{store.data.name}</Text>
                )}
              </View>

              {/* Store Owner Phone Number */}
              <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>Phone Number</Text>
                <Text style={styles.detailValue}>
                  {storeOwner.user.phone_number}
                </Text>
              </View>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="info" size={24} color="#1976d2" />
                <Text
                  style={[
                    styles.sectionTitle,
                    isSmallPhone && styles.textSmall,
                  ]}
                >
                  Account Information
                </Text>
              </View>

              <View style={styles.detailsGrid}>
                <View style={styles.detailCard}>
                  <Text style={styles.detailLabel}>Account Status</Text>
                  <Text
                    style={[
                      styles.detailValue,
                      {
                        color: storeOwner.user.isActive ? "#4caf50" : "#d32f2f",
                      },
                    ]}
                  >
                    {storeOwner.user.isActive ? "Active" : "Inactive"}
                  </Text>
                </View>

                <View style={styles.detailCard}>
                  <Text style={styles.detailLabel}>Member Since</Text>
                  <Text style={styles.detailValue}>
                    {new Date(storeOwner.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View
          style={[styles.actionButtons, isPhone && styles.actionButtonsPhone]}
        >
          <TouchableOpacity style={styles.secondaryButton}>
            <MaterialIcons name="password" size={20} color="#1976d2" />
            <Text style={styles.secondaryButtonText}>Change Password</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dangerButton}>
            <MaterialIcons name="delete-outline" size={20} color="#d32f2f" />
            <Text style={styles.dangerButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Navigation>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  contentContainerDesktop: {
    padding: 24,
    maxWidth: 1400,
    alignSelf: "center",
    width: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  errorText: {
    marginTop: 12,
    color: "#d32f2f",
    fontSize: 14,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: "#1976d2",
    borderRadius: 6,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  // ====== PROFILE HEADER ======
  profileHeader: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeaderPhone: {
    padding: 16,
  },
  profileHeaderContent: {
    flexDirection: "row",
    marginBottom: 16,
  },
  profileImageContainer: {
    position: "relative",
    marginRight: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e3f2fd",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    flex: 1,
    justifyContent: "center",
  },
  profileInfoPhone: {
    flex: 1,
  },
  ownerName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  ownerRole: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  contactInfo: {
    gap: 8,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  contactText: {
    fontSize: 13,
    color: "#666",
  },
  editForm: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: "#1a1a1a",
    backgroundColor: "#fafafa",
  },
  textArea: {
    textAlignVertical: "top",
    minHeight: 80,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    flexDirection: "row",
    backgroundColor: "#1976d2",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
    gap: 8,
  },
  editButtonActive: {
    backgroundColor: "#4caf50",
  },
  cancelButton: {
    backgroundColor: "#d32f2f",
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  // ====== SECTIONS ======
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionDesktop: {
    padding: 24,
  },
  sectionPhone: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  detailsGrid: {
    gap: 12,
  },
  detailsGridDesktop: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  detailCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    flex: 1,
    minWidth: "45%",
  },
  fullWidth: {
    minWidth: "100%",
  },
  detailLabel: {
    fontSize: 12,
    color: "#999",
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  detailValue: {
    fontSize: 14,
    color: "#1a1a1a",
    fontWeight: "500",
  },
  // ====== ACTION BUTTONS ======
  actionButtons: {
    gap: 12,
    marginBottom: 20,
  },
  actionButtonsPhone: {
    gap: 8,
  },
  secondaryButton: {
    flexDirection: "row",
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryButtonText: {
    color: "#1976d2",
    fontWeight: "600",
    fontSize: 14,
  },
  dangerButton: {
    flexDirection: "row",
    backgroundColor: "#ffebee",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  dangerButtonText: {
    color: "#d32f2f",
    fontWeight: "600",
    fontSize: 14,
  },
  // ====== RESPONSIVE TEXT ======
  textSmall: {
    fontSize: 16,
  },
  textTiny: {
    fontSize: 12,
  },
  textLarge: {
    fontSize: 24,
  },
});