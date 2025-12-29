import * as React from "react";
import { View, Text, StyleSheet, ActivityIndicator, useWindowDimensions, ScrollView } from "react-native";
import { Divider } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams } from "expo-router";

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
      const url = `http://localhost:8080/api/credits/customer/${id}`;
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
        <ActivityIndicator size={isPhone ? "large" : "large"} color="#1976d2" />
        <Text style={[styles.loadingText, isSmallPhone && styles.textSmall]}>
          Loading credit data...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.creditDetailsContainer}>
        <MaterialIcons name="error-outline" size={isSmallPhone ? 24 : 32} color="#d32f2f" />
        <Text style={[styles.errorText, isSmallPhone && styles.textSmall]}>Error: {error}</Text>
        <Text style={[styles.errorSubtext, isSmallPhone && styles.textTiny]}>
          {routeCustomerId ? `Customer ID: ${routeCustomerId}` : "No customer ID provided"}
        </Text>
      </View>
    );
  }

  if (!displayData || !displayData.credits || displayData.credits.length === 0) {
    return (
      <View style={styles.creditDetailsContainer}>
        <Text style={[styles.loadingText, isSmallPhone && styles.textSmall]}>
          No credit data available
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.creditHistorySection, isDesktop && styles.desktopContainer]}>
      <Text style={[styles.creditHistoryTitle, isSmallPhone && styles.titleSmall, isTablet && styles.titleTablet]}>
        <MaterialIcons name="history" size={isSmallPhone ? 16 : isTablet ? 20 : 18} color="#1a1a1a" /> Recent
        Transactions
      </Text>

      <View style={isDesktop && styles.gridContainer}>
        {(showAllTransactions
          ? displayData.credits
          : displayData.credits.slice(0, 3)
        ).map((transaction, index) => {
          const isCredit = transaction.transactionType === "credit_given";
          const isPayment = transaction.transactionType === "payment_received";

          return (
            <View
              key={transaction.id || index}
              style={[
                styles.transactionRow,
                isCredit && styles.transactionRowCredit,
                isPayment && styles.transactionRowPayment,
                isSmallPhone && styles.transactionRowSmall,
                isTablet && styles.transactionRowTablet,
                isDesktop && styles.transactionRowDesktop,
              ]}
            >
              <View style={styles.transactionLeft}>
                <View
                  style={[
                    styles.transactionIcon,
                    isSmallPhone && styles.iconSmall,
                    isTablet && styles.iconTablet,
                    isCredit && styles.iconCredit,
                    isPayment && styles.iconPayment,
                  ]}
                >
                  <MaterialIcons
                    name={isCredit ? "arrow-upward" : "arrow-downward"}
                    size={isSmallPhone ? 18 : isTablet ? 28 : 24}
                    color={isCredit ? "#1976d2" : "#4caf50"}
                  />
                </View>
                <View style={[styles.transactionInfo, isSmallPhone && styles.infoSmall]}>
                  <View style={[styles.transactionTypeRow, isSmallPhone && styles.typeRowSmall]}>
                    <Text
                      style={[
                        styles.transactionDescription,
                        isSmallPhone && styles.descriptionSmall,
                        isTablet && styles.descriptionTablet,
                      ]}
                      numberOfLines={isSmallPhone ? 1 : 2}
                    >
                      {transaction.itemsDescription || "No description"}
                    </Text>
                    <View
                      style={[
                        styles.transactionTypeBadge,
                        isSmallPhone && styles.badgeSmall,
                        isTablet && styles.badgeTablet,
                        isCredit && styles.badgeCredit,
                        isPayment && styles.badgePayment,
                      ]}
                    >
                      <Text
                        style={[
                          styles.transactionTypeText,
                          isSmallPhone && styles.badgeTextSmall,
                          isCredit && styles.badgeTextCredit,
                          isPayment && styles.badgeTextPayment,
                        ]}
                      >
                        {isCredit ? "Given" : "Received"}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.transactionDate, isSmallPhone && styles.dateSmall]}>
                    {transaction.transactionDate}
                  </Text>
                  {transaction.journalNumber && (
                    <Text style={[styles.transactionJournal, isSmallPhone && styles.journalSmall]}>
                      Journal: {transaction.journalNumber}
                    </Text>
                  )}
                </View>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  isSmallPhone && styles.amountSmall,
                  isTablet && styles.amountTablet,
                  isCredit && styles.amountCredit,
                  isPayment && styles.amountPayment,
                ]}
              >
                {isCredit ? "-" : "+"}Nu. {Number(transaction.amount).toLocaleString()}
              </Text>
            </View>
          );
        })}
      </View>

      {displayData.credits.length === 0 && (
        <Text style={[styles.noTransactions, isSmallPhone && styles.textSmall]}>
          No transactions found
        </Text>
      )}

      {displayData.credits.length > 3 && !showAllTransactions && (
        <Text
          style={[styles.clickableText, isSmallPhone && styles.buttonSmall]}
          onPress={() => setShowAllTransactions(true)}
        >
          Show all transactions
        </Text>
      )}
      {displayData.credits.length > 3 && showAllTransactions && (
        <Text
          style={[styles.clickableText, isSmallPhone && styles.buttonSmall]}
          onPress={() => setShowAllTransactions(false)}
        >
          Show less
        </Text>
      )}
      <Divider style={{ marginVertical: isSmallPhone ? 12 : isTablet ? 20 : 16 }} />
    </View>
  );
};

export default Transaction;

const styles = StyleSheet.create({
  creditDetailsContainer: {
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
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
    fontWeight: "600",
  },
  errorSubtext: {
    marginTop: 8,
    color: "#999",
    fontSize: 12,
  },
  creditHistorySection: {
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  desktopContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  creditHistoryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  titleSmall: {
    fontSize: 14,
    marginBottom: 6,
  },
  titleTablet: {
    fontSize: 18,
    marginBottom: 12,
  },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 6,
    marginBottom: 8,
  },
  transactionRowSmall: {
    padding: 8,
    marginBottom: 6,
  },
  transactionRowTablet: {
    padding: 12,
    marginBottom: 10,
  },
  transactionRowDesktop: {
    flex: 1,
    minWidth: "48%",
    padding: 14,
    marginBottom: 12,
  },
  transactionRowCredit: {
    borderLeftWidth: 4,
    borderLeftColor: "#1976d2",
  },
  transactionRowPayment: {
    borderLeftWidth: 4,
    borderLeftColor: "#4caf50",
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
  iconSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  iconTablet: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
  },
  iconCredit: {
    backgroundColor: "#e3f2fd",
  },
  iconPayment: {
    backgroundColor: "#e8f5e9",
  },
  transactionInfo: {
    flex: 1,
  },
  infoSmall: {
    gap: 2,
  },
  transactionTypeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  typeRowSmall: {
    marginBottom: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    flex: 1,
  },
  descriptionSmall: {
    fontSize: 12,
    fontWeight: "500",
  },
  descriptionTablet: {
    fontSize: 15,
  },
  transactionTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  badgeTablet: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 10,
  },
  badgeCredit: {
    backgroundColor: "#e3f2fd",
  },
  badgePayment: {
    backgroundColor: "#e8f5e9",
  },
  transactionTypeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  badgeTextSmall: {
    fontSize: 9,
    fontWeight: "600",
  },
  badgeTextCredit: {
    color: "#1976d2",
  },
  badgeTextPayment: {
    color: "#4caf50",
  },
  transactionDate: {
    fontSize: 12,
    color: "#666",
  },
  dateSmall: {
    fontSize: 11,
  },
  transactionJournal: {
    fontSize: 11,
    color: "#999",
    fontStyle: "italic",
    marginTop: 2,
  },
  journalSmall: {
    fontSize: 10,
    marginTop: 1,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  amountSmall: {
    fontSize: 13,
    marginLeft: 6,
  },
  amountTablet: {
    fontSize: 17,
  },
  amountCredit: {
    color: "#d32f2f",
  },
  amountPayment: {
    color: "#4caf50",
  },
  noTransactions: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    paddingVertical: 20,
    fontStyle: "italic",
  },
  clickableText: {
    color: "#1976d2",
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
  },
  buttonSmall: {
    fontSize: 12,
    marginTop: 6,
  },
});