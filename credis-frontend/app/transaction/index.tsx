import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
  TouchableOpacity,
  Platform,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams } from "expo-router";
import Navigation from "@/components/Navbar";

// Type definitions
type Transaction = {
  id?: string | number;
  transactionType: "credit_given" | "payment_received" | string;
  itemsDescription?: string;
  transactionDate?: string;
  journalNumber?: string;
  amount: number | string;
};

type CreditData = {
  credits: Transaction[];
};

interface TransactionSectionProps {
  customerId?: string | number;
  creditData?: CreditData;
  showAllTransactions: boolean;
  setShowAllTransactions: (show: boolean) => void;
}
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL;

const Transaction: React.FC<TransactionSectionProps> = ({
  customerId,
  creditData,
  showAllTransactions,
  setShowAllTransactions,
}) => {
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams();
  const routeCustomerId = params.customerId || customerId;

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<CreditData | null>(creditData || null);

  // Determine screen size
  const isSmallPhone = width < 360;
  const isPhone = width < 480;
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;

  // Fetch credits immediately on component mount
  React.useEffect(() => {
    console.log("Component mounted, customerId from route:", routeCustomerId);
    if (routeCustomerId) {
      fetchCustomerCredits(routeCustomerId);
    }
  }, []);

  const fetchCustomerCredits = async (id: string | number) => {
    try {
      setLoading(true);
      setError(null);
      const url = `${API_BASE_URL}/credits/customer/${id}`;
      console.log("Making request to:", url);

      const response = await fetch(url);
      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch credits: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("API Response:", result);

      // Handle different response formats
      if (Array.isArray(result)) {
        setData({ credits: result });
      } else if (result.credits) {
        setData(result);
      } else if (result.data) {
        setData({ credits: result.data });
      } else {
        setData({ credits: [] });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error fetching credits:", err);
    } finally {
      setLoading(false);
    }
  };

  // Use data from prop if provided, otherwise use fetched data
  const displayData = creditData || data;

  if (loading) {
    return (
      <View style={styles.creditDetailsContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={[styles.loadingText, isSmallPhone && styles.textSmall]}>
          Loading transactions...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorContent}>
          <MaterialIcons
            name="error-outline"
            size={isSmallPhone ? 40 : 48}
            color="#d32f2f"
          />
          <Text style={[styles.errorText, isSmallPhone && styles.textSmall]}>
            {error}
          </Text>
          <Text style={[styles.errorSubtext, isSmallPhone && styles.textTiny]}>
            {routeCustomerId
              ? `Customer ID: ${routeCustomerId}`
              : "No customer ID"}
          </Text>
        </View>
      </View>
    );
  }

  if (
    !displayData ||
    !displayData.credits ||
    displayData.credits.length === 0
  ) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="receipt-long" size={48} color="#ccc" />
        <Text style={[styles.emptyText, isSmallPhone && styles.textSmall]}>
          No Transactions
        </Text>
        <Text style={[styles.emptySubtext, isSmallPhone && styles.textTiny]}>
          Start by adding credit or payment transactions
        </Text>
      </View>
    );
  }

  const displayedTransactions = showAllTransactions
    ? displayData.credits
    : displayData.credits.slice(0, 5);

  const totalCredit = displayData.credits
    .filter((t) => t.transactionType === "credit_given")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalPayment = displayData.credits
    .filter((t) => t.transactionType === "payment_received")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <Navigation>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerTitleRow}>
            <View style={styles.titleIconContainer}>
              <MaterialIcons name="history" size={24} color="#1976d2" />
            </View>
            <Text
              style={[
                styles.creditHistoryTitle,
                isSmallPhone && styles.titleSmall,
                isTablet && styles.titleTablet,
              ]}
            >
              Transaction History
            </Text>
          </View>

          {/* Summary Cards */}
          <View
            style={[styles.summaryRow, isDesktop && styles.summaryRowDesktop]}
          >
            <View style={[styles.summaryCard, styles.creditCard]}>
              <View style={styles.summaryIconContainer}>
                <MaterialIcons name="arrow-upward" size={20} color="#1976d2" />
              </View>
              <View style={styles.summaryContent}>
                <Text style={styles.summaryLabel}>Credit Given</Text>
                <Text style={styles.summaryAmount}>
                  Nu. {totalCredit.toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={[styles.summaryCard, styles.paymentCard]}>
              <View style={styles.summaryIconContainer}>
                <MaterialIcons
                  name="arrow-downward"
                  size={20}
                  color="#4caf50"
                />
              </View>
              <View style={styles.summaryContent}>
                <Text style={styles.summaryLabel}>Payment Received</Text>
                <Text style={styles.summaryAmount}>
                  Nu. {totalPayment.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Transactions List */}
        <View
          style={[
            styles.transactionsContainer,
            isDesktop && styles.gridContainer,
          ]}
        >
          {displayedTransactions.map((transaction, index) => {
            const isCredit = transaction.transactionType === "credit_given";

            return (
              <View
                key={transaction.id || index}
                style={[
                  styles.transactionRow,
                  isCredit && styles.transactionRowCredit,
                  !isCredit && styles.transactionRowPayment,
                  isSmallPhone && styles.transactionRowSmall,
                  isTablet && styles.transactionRowTablet,
                  isDesktop && styles.transactionRowDesktop,
                ]}
              >
                {/* Left Section - Icon and Info */}
                <View style={styles.transactionLeft}>
                  <View
                    style={[
                      styles.transactionIcon,
                      isCredit && styles.iconCredit,
                      !isCredit && styles.iconPayment,
                    ]}
                  >
                    <MaterialIcons
                      name={isCredit ? "arrow-upward" : "arrow-downward"}
                      size={isSmallPhone ? 18 : isTablet ? 24 : 20}
                      color="#fff"
                    />
                  </View>

                  <View style={styles.transactionInfo}>
                    {/* Description and Badge Row */}
                    <View style={styles.descriptionRow}>
                      <Text
                        style={[
                          styles.transactionDescription,
                          isSmallPhone && styles.descriptionSmall,
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {transaction.itemsDescription || "Transaction"}
                      </Text>
                      <View
                        style={[
                          styles.typeBadge,
                          isCredit && styles.badgeCredit,
                          !isCredit && styles.badgePayment,
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeText,
                            isSmallPhone && styles.badgeTextSmall,
                          ]}
                        >
                          {isCredit ? "Given" : "Received"}
                        </Text>
                      </View>
                    </View>

                    {/* Date and Journal Info */}
                    <View style={styles.metaInfo}>
                      <View style={styles.metaItem}>
                        <MaterialIcons
                          name="calendar-today"
                          size={12}
                          color="#999"
                        />
                        <Text style={styles.metaText}>
                          {transaction.transactionDate}
                        </Text>
                      </View>
                      {transaction.journalNumber && (
                        <View style={styles.metaItem}>
                          <MaterialIcons
                            name="receipt"
                            size={12}
                            color="#999"
                          />
                          <Text style={styles.metaText}>
                            {transaction.journalNumber}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                {/* Right Section - Amount */}
                <View style={styles.amountSection}>
                  <Text
                    style={[
                      styles.transactionAmount,
                      isCredit && styles.amountCredit,
                      !isCredit && styles.amountPayment,
                    ]}
                  >
                    {isCredit ? "-" : "+"}
                  </Text>
                  <Text
                    style={[
                      styles.amountValue,
                      isSmallPhone && styles.amountSmall,
                    ]}
                  >
                    Nu. {Number(transaction.amount).toLocaleString()}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Show More/Less Button */}
        {displayData.credits.length > 5 && (
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.showMoreButton}
              onPress={() => setShowAllTransactions(!showAllTransactions)}
            >
              <Text style={styles.showMoreText}>
                {showAllTransactions
                  ? "Show Less"
                  : `Show All (${displayData.credits.length})`}
              </Text>
              <MaterialIcons
                name={showAllTransactions ? "expand-less" : "expand-more"}
                size={20}
                color="#1976d2"
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Navigation>
  );
};

export default Transaction;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  containerDesktop: {
    borderRadius: 16,
  },
  creditDetailsContainer: {
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
  },
  errorContainer: {
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
    backgroundColor: "#ffebee",
    borderRadius: 12,
  },
  errorContent: {
    alignItems: "center",
  },
  emptyContainer: {
    padding: 32,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 240,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 16,
    textAlign: "center",
  },
  textSmall: {
    fontSize: 14,
  },
  textTiny: {
    fontSize: 10,
  },
  errorText: {
    marginTop: 12,
    color: "#d32f2f",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "700",
  },
  errorSubtext: {
    marginTop: 6,
    color: "#999",
    fontSize: 12,
  },
  emptyText: {
    marginTop: 12,
    color: "#666",
    fontSize: 16,
    fontWeight: "700",
  },
  emptySubtext: {
    marginTop: 6,
    color: "#999",
    fontSize: 13,
  },
  headerSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  titleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e3f2fd",
    justifyContent: "center",
    alignItems: "center",
  },
  creditHistoryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  titleSmall: {
    fontSize: 16,
  },
  titleTablet: {
    fontSize: 20,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
  },
  summaryRowDesktop: {
    gap: 16,
  },
  summaryCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    gap: 12,
  },
  creditCard: {
    backgroundColor: "#e3f2fd",
  },
  paymentCard: {
    backgroundColor: "#e8f5e9",
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 11,
    color: "#666",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  summaryAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
    marginTop: 2,
  },
  transactionsContainer: {
    padding: 16,
    gap: 8,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 12,
  },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    borderLeftWidth: 4,
  },
  transactionRowSmall: {
    padding: 10,
  },
  transactionRowTablet: {
    padding: 14,
  },
  transactionRowDesktop: {
    flex: 1,
    minWidth: "48%",
    padding: 14,
  },
  transactionRowCredit: {
    borderLeftColor: "#1976d2",
    backgroundColor: "#f0f7ff",
  },
  transactionRowPayment: {
    borderLeftColor: "#4caf50",
    backgroundColor: "#f5fdf5",
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    gap: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  iconCredit: {
    backgroundColor: "#1976d2",
  },
  iconPayment: {
    backgroundColor: "#4caf50",
  },
  transactionInfo: {
    flex: 1,
    gap: 6,
  },
  descriptionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    flex: 1,
  },
  descriptionSmall: {
    fontSize: 13,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeCredit: {
    backgroundColor: "#bbdefb",
  },
  badgePayment: {
    backgroundColor: "#c8e6c9",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  badgeTextSmall: {
    fontSize: 10,
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: "#999",
  },
  amountSection: {
    alignItems: "flex-end",
    marginLeft: 8,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: "700",
  },
  amountValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
    marginTop: 2,
  },
  amountSmall: {
    fontSize: 12,
  },
  amountCredit: {
    color: "#d32f2f",
  },
  amountPayment: {
    color: "#4caf50",
  },
  actionContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    alignItems: "center",
  },
  showMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1976d2",
    gap: 6,
  },
  showMoreText: {
    color: "#1976d2",
    fontWeight: "600",
    fontSize: 14,
  },
});
