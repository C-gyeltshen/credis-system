import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter, usePathname } from "expo-router";

interface NavItem {
  id: string;
  label: string;
  icon: string;
  route: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "customers",
    label: "Customers",
    icon: "people",
    route: "/customer-dashboard",
  },
  {
    id: "overdue",
    label: "Overdue",
    icon: "schedule",
    route: "/OverdueAccountsReport",
  },
  {
    id: "profile",
    label: "Profile",
    icon: "person",
    route: "/profile",
  },
  // {
  //   id: "payment",
  //   label: "Confirm Payment",
  //   icon: "payment",
  //   route: "/payment",
  // },
];

interface NavigationProps {
  children: React.ReactNode;
}

const Navigation: React.FC<NavigationProps> = ({ children }) => {
  const { width, height } = useWindowDimensions();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Determine layout based on screen width
  const isLargeScreen = width >= 1024; // Desktop/Tablet landscape
  const isMediumScreen = width >= 768 && width < 1024; // Tablet
  const isSmallScreen = width < 768; // Phone

  // Determine if using sidebar or bottom nav
  const useSidebar = isLargeScreen || (isMediumScreen && height > width);
  const useBottomNav = !useSidebar;

  const isActive = (route: string) => pathname === route;

  const handleNavigation = (route: string) => {
    router.push(route as any);
  };

  // Sidebar Navigation for Large Screens
  const SidebarNav = () => (
    <View style={[styles.sidebar, !sidebarOpen && styles.sidebarCollapsed]}>
      {/* Sidebar Header */}
      <View style={styles.sidebarHeader}>
        <View style={styles.logoContainer}>
          <MaterialIcons name="dashboard" size={28} color="#fff" />
          {sidebarOpen && (
            <Text style={styles.logoText}>Credit System</Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => setSidebarOpen(!sidebarOpen)}
          style={styles.toggleButton}
        >
          <MaterialIcons
            name={sidebarOpen ? "menu-open" : "menu"}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* Navigation Items */}
      <ScrollView style={styles.navItemsContainer}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.route);
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.sidebarItem,
                active && styles.sidebarItemActive,
              ]}
              onPress={() => handleNavigation(item.route)}
            >
              <View style={styles.sidebarItemContent}>
                <MaterialIcons
                  name={item.icon as any}
                  size={24}
                  color={active ? "#1976d2" : "#666"}
                />
                {sidebarOpen && (
                  <Text
                    style={[
                      styles.sidebarItemText,
                      active && styles.sidebarItemTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                )}
              </View>
              {sidebarOpen && active && (
                <View style={styles.activeIndicator} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Sidebar Footer */}
      <View style={styles.sidebarFooter}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => Alert.alert("Logout", "Are you sure?")}
        >
          <MaterialIcons name="logout" size={24} color="#d32f2f" />
          {sidebarOpen && (
            <Text style={styles.logoutText}>Logout</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  // Bottom Navigation for Small Screens
  const BottomNav = () => (
    <View style={styles.bottomNav}>
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.route);
        return (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.bottomNavItem,
              active && styles.bottomNavItemActive,
            ]}
            onPress={() => handleNavigation(item.route)}
          >
            <MaterialIcons
              name={item.icon as any}
              size={24}
              color={active ? "#1976d2" : "#999"}
            />
            <Text
              style={[
                styles.bottomNavLabel,
                active && styles.bottomNavLabelActive,
              ]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainWrapper}>
        {useSidebar && <SidebarNav />}
        <View style={[styles.content, useBottomNav && styles.contentWithBottomNav]}>
          {children}
        </View>
      </View>
      {useBottomNav && <BottomNav />}
    </SafeAreaView>
  );
};

export default Navigation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  mainWrapper: {
    flex: 1,
    flexDirection: "row",
  },
  // ====== SIDEBAR STYLES ======
  sidebar: {
    width: 260,
    backgroundColor: "#1a1a1a",
    borderRightWidth: 1,
    borderRightColor: "#333",
    flexDirection: "column",
  },
  sidebarCollapsed: {
    width: 80,
  },
  sidebarHeader: {
    backgroundColor: "#0d47a1",
    paddingVertical: 16,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logoText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 12,
  },
  toggleButton: {
    padding: 8,
  },
  navItemsContainer: {
    flex: 1,
    paddingVertical: 12,
  },
  sidebarItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderLeftWidth: 4,
    borderLeftColor: "transparent",
  },
  sidebarItemActive: {
    backgroundColor: "#f5f5f5",
    borderLeftColor: "#1976d2",
  },
  sidebarItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  sidebarItemText: {
    fontSize: 14,
    color: "#999",
    marginLeft: 12,
    fontWeight: "500",
  },
  sidebarItemTextActive: {
    color: "#1976d2",
    fontWeight: "600",
  },
  activeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#1976d2",
    marginRight: 8,
  },
  sidebarFooter: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: "#ffe0e0",
  },
  logoutText: {
    fontSize: 13,
    color: "#d32f2f",
    marginLeft: 12,
    fontWeight: "600",
  },
  // ====== CONTENT STYLES ======
  content: {
    flex: 1,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  contentWithBottomNav: {
    paddingBottom: 20,
  },
  // ====== BOTTOM NAV STYLES ======
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingVertical: 8,
    paddingHorizontal: 4,
    justifyContent: "space-around",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  bottomNavItemActive: {
    backgroundColor: "#e3f2fd",
  },
  bottomNavLabel: {
    fontSize: 10,
    color: "#999",
    marginTop: 4,
    fontWeight: "500",
  },
  bottomNavLabelActive: {
    color: "#1976d2",
    fontWeight: "600",
  },
});