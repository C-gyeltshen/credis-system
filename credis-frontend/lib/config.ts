// API Configuration - Using mock data for demo
export const API_CONFIG = {
  USE_MOCK_DATA: true, // Set to false when backend is ready
  BASE_URL: "http://localhost:8080/api", // Backend API URL (when ready)
  ENDPOINTS: {
    CUSTOMERS: "/customers",
  },
};

// Store Configuration - Replace with actual store ID
export const STORE_CONFIG = {
  // This should come from user authentication/session in a real app
  STORE_ID: "008ee969-0c0d-4d24-b83d-9e85f2daf86e",
};
