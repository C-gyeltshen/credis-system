import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  Image,
  Alert,
  TextInput,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Navigation from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { router } from "expo-router";

interface StoreOwner {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
}

interface StoreDetails {
  id: string;
  storeName: string;
  storeDescription: string;
  address: string;
  city: string;
  country: string;
  registrationNumber: string;
  taxId: string;
  established: string;
  website?: string;
  totalCustomers: number;
  totalTransactions: number;
  totalRevenue: number;
}

export default function ProfilePage() {
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [storeOwner, setStoreOwner] = useState<StoreOwner | null>(null);
  const [storeDetails, setStoreDetails] = useState<StoreDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isLoading} = useAuth();

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
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch store owner data
      const ownerResponse = await fetch(
        "http://localhost:8080/api/store-owner/profile"
      );
      if (!ownerResponse.ok) {
        throw new Error("Failed to fetch store owner data");
      }
      const ownerData = await ownerResponse.json();
      setStoreOwner(ownerData);

      // Fetch store details
      const storeResponse = await fetch(
        "http://localhost:8080/api/store-details"
      );
      if (!storeResponse.ok) {
        throw new Error("Failed to fetch store details");
      }
      const storeData = await storeResponse.json();
      setStoreDetails(storeData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = () => {
    Alert.alert("Success", "Profile updated successfully!");
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

  if (error || !storeOwner || !storeDetails) {
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
        <View style={[styles.profileHeader, isPhone && styles.profileHeaderPhone]}>
          <View style={styles.profileHeaderContent}>
            <View style={styles.profileImageContainer}>
              <Image
                source={{ uri: storeOwner.profileImage || "https://via.placeholder.com/120" }}
                style={styles.profileImage}
              />
              {isEditing && (
                <TouchableOpacity style={styles.editImageButton}>
                  <MaterialIcons name="camera-alt" size={20} color="#fff" />
                </TouchableOpacity>
              )}
            </View>

            <View
              style={[
                styles.profileInfo,
                isPhone && styles.profileInfoPhone,
              ]}
            >
              <Text
                style={[
                  styles.ownerName,
                  isSmallPhone && styles.textSmall,
                  isTablet && styles.textLarge,
                ]}
              >
                {storeOwner.name}
              </Text>
              <Text style={[styles.ownerRole, isSmallPhone && styles.textTiny]}>
                Store Owner
              </Text>

              {isEditing ? (
                <View style={styles.editForm}>
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={storeOwner.email}
                    onChangeText={(text) =>
                      setStoreOwner({ ...storeOwner, email: text })
                    }
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Phone"
                    value={storeOwner.phone}
                    onChangeText={(text) =>
                      setStoreOwner({ ...storeOwner, phone: text })
                    }
                  />
                </View>
              ) : (
                <View style={styles.contactInfo}>
                  <View style={styles.contactItem}>
                    <MaterialIcons name="email" size={16} color="#666" />
                    <Text style={styles.contactText}>{storeOwner.email}</Text>
                  </View>
                  <View style={styles.contactItem}>
                    <MaterialIcons name="phone" size={16} color="#666" />
                    <Text style={styles.contactText}>{storeOwner.phone}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Edit Button */}
          <TouchableOpacity
            style={[
              styles.editButton,
              isEditing && styles.editButtonActive,
            ]}
            onPress={
              isEditing ? handleSaveChanges : () => setIsEditing(true)
            }
          >
            <MaterialIcons
              name={isEditing ? "check" : "edit"}
              size={20}
              color="#fff"
            />
            <Text style={styles.editButtonText}>
              {isEditing ? "Save" : "Edit"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Store Details Section */}
        <View
          style={[
            styles.section,
            isDesktop && styles.sectionDesktop,
            isPhone && styles.sectionPhone,
          ]}
        >
          <View style={styles.sectionHeader}>
            <MaterialIcons name="store" size={24} color="#1976d2" />
            <Text style={[styles.sectionTitle, isSmallPhone && styles.textSmall]}>
              Store Details
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
                  value={storeDetails.storeName}
                  onChangeText={(text) =>
                    setStoreDetails({ ...storeDetails, storeName: text })
                  }
                />
              ) : (
                <Text style={styles.detailValue}>
                  {storeDetails.storeName}
                </Text>
              )}
            </View>

            {/* Registration Number */}
            <View style={styles.detailCard}>
              <Text style={styles.detailLabel}>Registration #</Text>
              <Text style={styles.detailValue}>
                {storeDetails.registrationNumber}
              </Text>
            </View>

            {/* Tax ID */}
            <View style={styles.detailCard}>
              <Text style={styles.detailLabel}>Tax ID</Text>
              <Text style={styles.detailValue}>{storeDetails.taxId}</Text>
            </View>

            {/* Established */}
            <View style={styles.detailCard}>
              <Text style={styles.detailLabel}>Established</Text>
              <Text style={styles.detailValue}>{storeDetails.established}</Text>
            </View>

            {/* Address */}
            <View style={[styles.detailCard, styles.fullWidth]}>
              <Text style={styles.detailLabel}>Address</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={storeDetails.address}
                  onChangeText={(text) =>
                    setStoreDetails({ ...storeDetails, address: text })
                  }
                />
              ) : (
                <Text style={styles.detailValue}>{storeDetails.address}</Text>
              )}
            </View>

            {/* City */}
            <View style={styles.detailCard}>
              <Text style={styles.detailLabel}>City</Text>
              <Text style={styles.detailValue}>{storeDetails.city}</Text>
            </View>

            {/* Country */}
            <View style={styles.detailCard}>
              <Text style={styles.detailLabel}>Country</Text>
              <Text style={styles.detailValue}>{storeDetails.country}</Text>
            </View>

            {/* Website */}
            {storeDetails.website && (
              <View style={[styles.detailCard, styles.fullWidth]}>
                <Text style={styles.detailLabel}>Website</Text>
                <Text style={styles.detailValue}>{storeDetails.website}</Text>
              </View>
            )}

            {/* Description */}
            <View style={[styles.detailCard, styles.fullWidth]}>
              <Text style={styles.detailLabel}>Description</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={storeDetails.storeDescription}
                  onChangeText={(text) =>
                    setStoreDetails({ ...storeDetails, storeDescription: text })
                  }
                  multiline
                  numberOfLines={4}
                />
              ) : (
                <Text style={styles.detailValue}>
                  {storeDetails.storeDescription}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Statistics Section */}
        <View
          style={[
            styles.section,
            isDesktop && styles.sectionDesktop,
            isPhone && styles.sectionPhone,
          ]}
        >
          <View style={styles.sectionHeader}>
            <MaterialIcons name="assessment" size={24} color="#1976d2" />
            <Text style={[styles.sectionTitle, isSmallPhone && styles.textSmall]}>
              Statistics
            </Text>
          </View>

          <View style={[styles.statsGrid, isDesktop && styles.statsGridDesktop]}>
            {/* Total Customers */}
            <View style={[styles.statCard, isDesktop && styles.statCardDesktop]}>
              <View style={styles.statIconContainer}>
                <MaterialIcons
                  name="people"
                  size={28}
                  color="#1976d2"
                />
              </View>
              <Text style={styles.statValue}>
                {storeDetails.totalCustomers.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Total Customers</Text>
            </View>

            {/* Total Transactions */}
            <View style={[styles.statCard, isDesktop && styles.statCardDesktop]}>
              <View style={styles.statIconContainer}>
                <MaterialIcons
                  name="receipt"
                  size={28}
                  color="#4caf50"
                />
              </View>
              <Text style={styles.statValue}>
                {storeDetails.totalTransactions.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Transactions</Text>
            </View>

            {/* Total Revenue */}
            <View style={[styles.statCard, isDesktop && styles.statCardDesktop]}>
              <View style={styles.statIconContainer}>
                <MaterialIcons
                  name="trending-up"
                  size={28}
                  color="#ff9800"
                />
              </View>
              <Text style={styles.statValue}>
                Nu. {(storeDetails.totalRevenue / 1000).toFixed(1)}K
              </Text>
              <Text style={styles.statLabel}>Total Revenue</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={[styles.actionButtons, isPhone && styles.actionButtonsPhone]}>
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
    backgroundColor: "#e0e0e0",
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#1976d2",
    borderRadius: 20,
    padding: 8,
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
  },
  textArea: {
    textAlignVertical: "top",
    minHeight: 100,
  },
  editButton: {
    flexDirection: "row",
    backgroundColor: "#1976d2",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
  },
  editButtonActive: {
    backgroundColor: "#4caf50",
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
  // ====== STATISTICS ======
  statsGrid: {
    gap: 12,
  },
  statsGridDesktop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  statCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    flex: 1,
  },
  statCardDesktop: {
    minWidth: "30%",
  },
  statIconContainer: {
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
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