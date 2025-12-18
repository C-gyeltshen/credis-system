# Credis System - Customer Registration Frontend (FR1.1)

## Implementation Overview

This is a **frontend-only implementation** of the Customer Registration system (FR1.1) for the Credis System using React Native and Expo. The app uses mock data to simulate backend functionality and demonstrate the complete user interface and user experience.

## Features Implemented

### Mobile App (React Native + Expo)

- **Customer List Screen**: Display all customers with search and pagination
- **Customer Form Screen**: Add/Edit customer information
- **Tab Navigation**: Easy access to customer management
- **Real-time Search**: Search customers as you type
- **Form Validation**: Client-side validation with error messages
- **Mock Data Service**: Simulates backend API calls with realistic delays
- **Responsive UI**: Modern, mobile-friendly interface

### Customer Management Features

- ✅ **Create** customers with validation
- ✅ **Update** existing customer information
- ✅ **Search** customers by name, phone, email, address, or CID
- ✅ **List** customers with pagination
- ✅ **Delete** customers with confirmation
- ✅ **Duplicate prevention** (unique phone numbers)
- ✅ **Real-time updates** and responsive design

## Customer Data Model

```typescript
interface Customer {
  id: string; // Unique identifier
  name: string; // Customer name (required)
  phoneNumber: string; // Phone number (required, unique)
  address?: string; // Customer address
  email?: string; // Email address
  cidNumber?: string; // CID/ID number
  creditLimit?: number; // Credit limit in currency
  createdAt: string; // Creation timestamp
  modifiedAt: string; // Last update timestamp
}
```

## Project Structure

```
credis-frontend/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab navigation
│   │   ├── customers.tsx        # Customer tab entry
│   │   ├── index.tsx           # Home tab
│   │   └── explore.tsx         # Explore tab
│   ├── customer-dashboard/
│   │   ├── _layout.tsx         # Stack navigation
│   │   ├── index.tsx           # Redirect to customers
│   │   ├── customers.tsx       # Customer list screen
│   │   └── customer-form.tsx   # Add/Edit customer form
│   └── _layout.tsx             # Root layout
├── lib/
│   ├── config.ts               # App configuration
│   └── mock-customer-service.ts # Mock data service
└── components/                 # Reusable UI components
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- Expo CLI: `npm install -g @expo/cli`
- Expo Go app on your mobile device (for testing)

### Installation

1. Navigate to the frontend directory:

   ```bash
   cd credis-system/credis-frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

4. Open Expo Go on your mobile device and scan the QR code

### Configuration

The app configuration is in `lib/config.ts`:

```typescript
export const API_CONFIG = {
  USE_MOCK_DATA: true, // Always true for this demo
  BASE_URL: "http://localhost:3000/api", // Future backend URL
  ENDPOINTS: {
    CUSTOMERS: "/customers",
  },
};

export const STORE_CONFIG = {
  STORE_ID: "demo-store-123", // Demo store ID
};
```

## Mock Data Service

The `MockCustomerService` in `lib/mock-customer-service.ts` provides:

- **Realistic API simulation** with network delays
- **5 sample customers** for demo purposes
- **Search functionality** across all text fields
- **Pagination** with configurable page size
- **CRUD operations** with proper error handling
- **Duplicate phone number validation**
- **Data persistence** during the app session

### Sample Customers

The app comes pre-loaded with 5 sample customers:

1. John Doe (+1234567890)
2. Jane Smith (+1987654321)
3. Bob Johnson (+1555123456)
4. Alice Brown (+1444567890)
5. Charlie Wilson (+1333987654)

## Usage Examples

### Adding a New Customer

1. Open the app and navigate to the "Customers" tab
2. Tap the "+" button in the header
3. Fill in the customer information (name and phone are required)
4. Tap "Save" to create the customer

### Searching for Customers

1. In the customer list, use the search bar at the top
2. Type any part of the customer's name, phone, email, or address
3. Results update in real-time as you type
4. Clear the search to see all customers

### Editing a Customer

1. In the customer list, tap the blue edit button (pencil icon)
2. Modify the customer information
3. Tap "Save" to update the customer

### Deleting a Customer

1. In the customer list, tap the red delete button (trash icon)
2. Confirm the deletion in the popup dialog
3. The customer will be removed from the list

## Validation Rules

### Required Fields

- **Name**: Customer name (minimum 1 character)
- **Phone Number**: Must be a valid phone number format

### Optional Fields

- **Address**: Customer address (free text)
- **Email**: Must be valid email format if provided
- **CID Number**: Customer ID number (free text)
- **Credit Limit**: Must be a valid number if provided

### Business Rules

- Phone numbers must be unique (duplicate prevention)
- All text fields are trimmed of whitespace
- Search is case-insensitive
- Email validation uses standard regex pattern

## UI Components and Features

### Customer List Screen

- **Header**: Title with add button
- **Search Bar**: Real-time search with clear button
- **Customer Cards**: Display customer info with action buttons
- **Pull to Refresh**: Swipe down to refresh the list
- **Infinite Scroll**: Load more customers as you scroll
- **Empty State**: Helpful message when no customers found

### Customer Form Screen

- **Modal Presentation**: Slide up form for adding/editing
- **Input Validation**: Real-time validation with error messages
- **Keyboard Handling**: Proper keyboard avoidance
- **Save/Cancel**: Clear action buttons
- **Loading States**: Feedback during save operations

### Navigation

- **Tab Navigation**: Bottom tabs for easy access
- **Stack Navigation**: Hierarchical screens within customer section
- **Back Navigation**: Proper back button handling

## Error Handling

The app includes comprehensive error handling:

- **Network Errors**: Graceful handling of service errors
- **Validation Errors**: Clear field-level error messages
- **User Feedback**: Toast messages and alerts for actions
- **Loading States**: Visual feedback during operations
- **Empty States**: Helpful messages when no data available

## Future Backend Integration

When a backend API is ready:

1. **Update Configuration**: Change `USE_MOCK_DATA` to `false` in `lib/config.ts`
2. **Set API URL**: Update `BASE_URL` to your backend endpoint
3. **Remove Mock Service**: The app will automatically use real API calls
4. **Add Authentication**: Implement user login and token management
5. **Error Handling**: Add backend-specific error handling

The frontend is designed to easily switch from mock data to real API calls with minimal code changes.

## Technology Stack

- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform and toolchain
- **TypeScript** - Type safety and better development experience
- **Expo Router** - File-based navigation system
- **React Navigation** - Tab and stack navigation
- **Expo Vector Icons** - Icon library

## Testing

The app can be tested by:

1. **Expo Go**: Scan QR code for instant device testing
2. **iOS Simulator**: Run on macOS with Xcode
3. **Android Emulator**: Run on Android Studio emulator
4. **Physical Devices**: Install Expo Go app and scan QR code

## Performance Considerations

- **Lazy Loading**: Components load on demand
- **Optimized Lists**: FlatList for efficient scrolling
- **Image Optimization**: Vector icons for crisp display
- **Memory Management**: Proper cleanup of listeners
- **Bundle Size**: Tree-shaking eliminates unused code

## Accessibility

The app includes accessibility features:

- **Screen Reader Support**: Proper accessibility labels
- **Touch Targets**: Minimum 44pt touch areas
- **Color Contrast**: High contrast for readability
- **Font Scaling**: Respects system font size settings

## Known Limitations

Since this is a frontend-only implementation:

- **Data Persistence**: Data resets when app restarts
- **Offline Support**: No offline functionality
- **Multi-user**: No user authentication or multi-tenancy
- **Real-time Updates**: No push notifications or real-time sync
- **File Upload**: No image upload for customer photos

## Support

For questions about the frontend implementation, refer to:

- **Expo Documentation**: https://docs.expo.dev/
- **React Native Docs**: https://reactnative.dev/docs/getting-started
- **Component Library**: Check the `components/` directory for reusable components

This frontend implementation provides a complete demonstration of the Customer Registration feature and can serve as the foundation for the full Credis System.
