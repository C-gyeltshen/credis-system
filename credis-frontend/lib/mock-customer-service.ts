// Mock data for customer management demo
export interface Customer {
  id: string;
  name: string;
  phoneNumber: string;
  address?: string;
  email?: string;
  cidNumber?: string;
  creditLimit?: number;
  createdAt: string;
  modifiedAt: string;
}

// Mock customer data
let mockCustomers: Customer[] = [
  {
    id: "1",
    name: "John Doe",
    phoneNumber: "+1234567890",
    address: "123 Main St, City, State 12345",
    email: "john.doe@email.com",
    cidNumber: "CID123456",
    creditLimit: 1000.0,
    createdAt: "2024-01-15T10:00:00Z",
    modifiedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    name: "Jane Smith",
    phoneNumber: "+1987654321",
    address: "456 Oak Ave, City, State 67890",
    email: "jane.smith@email.com",
    cidNumber: "CID789012",
    creditLimit: 1500.0,
    createdAt: "2024-01-16T14:30:00Z",
    modifiedAt: "2024-01-16T14:30:00Z",
  },
  {
    id: "3",
    name: "Bob Johnson",
    phoneNumber: "+1555123456",
    address: "789 Pine St, City, State 11111",
    email: "bob.johnson@email.com",
    creditLimit: 500.0,
    createdAt: "2024-01-17T09:15:00Z",
    modifiedAt: "2024-01-17T09:15:00Z",
  },
  {
    id: "4",
    name: "Alice Brown",
    phoneNumber: "+1444567890",
    address: "321 Elm Dr, City, State 22222",
    email: "alice.brown@email.com",
    cidNumber: "CID345678",
    creditLimit: 2000.0,
    createdAt: "2024-01-18T16:45:00Z",
    modifiedAt: "2024-01-18T16:45:00Z",
  },
  {
    id: "5",
    name: "Charlie Wilson",
    phoneNumber: "+1333987654",
    address: "654 Maple Ave, City, State 33333",
    creditLimit: 750.0,
    createdAt: "2024-01-19T11:20:00Z",
    modifiedAt: "2024-01-19T11:20:00Z",
  },
  {
    id: "6",
    name: "Diana Martinez",
    phoneNumber: "+1222555888",
    address: "987 Cedar Ln, City, State 44444",
    email: "diana.martinez@email.com",
    cidNumber: "CID456789",
    creditLimit: 1200.0,
    createdAt: "2024-01-20T13:10:00Z",
    modifiedAt: "2024-01-20T13:10:00Z",
  },
  {
    id: "7",
    name: "Edward Davis",
    phoneNumber: "+1777444111",
    address: "159 Birch Rd, City, State 55555",
    email: "edward.davis@email.com",
    creditLimit: 900.0,
    createdAt: "2024-01-21T08:30:00Z",
    modifiedAt: "2024-01-21T08:30:00Z",
  },
  {
    id: "8",
    name: "Fiona Garcia",
    phoneNumber: "+1666333999",
    address: "753 Spruce St, City, State 66666",
    email: "fiona.garcia@email.com",
    cidNumber: "CID567890",
    creditLimit: 1800.0,
    createdAt: "2024-01-22T15:45:00Z",
    modifiedAt: "2024-01-22T15:45:00Z",
  },
  {
    id: "9",
    name: "George Kim",
    phoneNumber: "+1888777222",
    address: "246 Willow Way, City, State 77777",
    email: "george.kim@email.com",
    creditLimit: 650.0,
    createdAt: "2024-01-23T10:20:00Z",
    modifiedAt: "2024-01-23T10:20:00Z",
  },
  {
    id: "10",
    name: "Helen Chen",
    phoneNumber: "+1999888555",
    address: "864 Poplar Ave, City, State 88888",
    email: "helen.chen@email.com",
    cidNumber: "CID678901",
    creditLimit: 2200.0,
    createdAt: "2024-01-24T12:15:00Z",
    modifiedAt: "2024-01-24T12:15:00Z",
  },
  {
    id: "11",
    name: "Ivan Petrov",
    phoneNumber: "+1555222777",
    address: "135 Ash Blvd, City, State 99999",
    email: "ivan.petrov@email.com",
    creditLimit: 800.0,
    createdAt: "2024-01-25T14:40:00Z",
    modifiedAt: "2024-01-25T14:40:00Z",
  },
  {
    id: "12",
    name: "Jessica Wong",
    phoneNumber: "+1333666444",
    address: "579 Holly Dr, City, State 10101",
    email: "jessica.wong@email.com",
    cidNumber: "CID789012",
    creditLimit: 1350.0,
    createdAt: "2024-01-26T09:25:00Z",
    modifiedAt: "2024-01-26T09:25:00Z",
  },
  {
    id: "13",
    name: "Kevin Thompson",
    phoneNumber: "+1444777333",
    address: "802 Sycamore St, City, State 20202",
    email: "kevin.thompson@email.com",
    creditLimit: 1100.0,
    createdAt: "2024-01-27T11:50:00Z",
    modifiedAt: "2024-01-27T11:50:00Z",
  },
  {
    id: "14",
    name: "Laura Anderson",
    phoneNumber: "+1777111888",
    address: "468 Chestnut Ave, City, State 30303",
    email: "laura.anderson@email.com",
    cidNumber: "CID890123",
    creditLimit: 950.0,
    createdAt: "2024-01-28T16:30:00Z",
    modifiedAt: "2024-01-28T16:30:00Z",
  },
  {
    id: "15",
    name: "Michael Rodriguez",
    phoneNumber: "+1666999222",
    address: "913 Magnolia Rd, City, State 40404",
    email: "michael.rodriguez@email.com",
    creditLimit: 1750.0,
    createdAt: "2024-01-29T08:45:00Z",
    modifiedAt: "2024-01-29T08:45:00Z",
  },
];

// Generate a new ID
const generateId = (): string => {
  return (mockCustomers.length + 1).toString();
};

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockCustomerService {
  static async getCustomers(params: {
    storeId: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    await delay(500); // Simulate network delay

    let filteredCustomers = [...mockCustomers];

    // Apply search filter
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredCustomers = filteredCustomers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchLower) ||
          customer.phoneNumber.includes(searchLower) ||
          (customer.email &&
            customer.email.toLowerCase().includes(searchLower)) ||
          (customer.address &&
            customer.address.toLowerCase().includes(searchLower)) ||
          (customer.cidNumber &&
            customer.cidNumber.toLowerCase().includes(searchLower))
      );
    }

    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

    return {
      customers: paginatedCustomers,
      totalCount: filteredCustomers.length,
      page,
      limit,
      totalPages: Math.ceil(filteredCustomers.length / limit),
    };
  }

  static async getCustomer(id: string, storeId: string) {
    await delay(300);

    const customer = mockCustomers.find((c) => c.id === id);
    if (!customer) {
      throw new Error("Customer not found");
    }
    return customer;
  }

  static async createCustomer(
    customerData: Omit<Customer, "id" | "createdAt" | "modifiedAt">
  ) {
    await delay(800);

    // Check for duplicate phone number
    const existingCustomer = mockCustomers.find(
      (c) => c.phoneNumber === customerData.phoneNumber
    );
    if (existingCustomer) {
      throw new Error("Customer with this phone number already exists");
    }

    const newCustomer: Customer = {
      ...customerData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    };

    mockCustomers.push(newCustomer);
    return newCustomer;
  }

  static async updateCustomer(
    id: string,
    customerData: Partial<Omit<Customer, "id" | "createdAt" | "modifiedAt">>
  ) {
    await delay(600);

    const customerIndex = mockCustomers.findIndex((c) => c.id === id);
    if (customerIndex === -1) {
      throw new Error("Customer not found");
    }

    // Check for duplicate phone number (excluding current customer)
    if (customerData.phoneNumber) {
      const existingCustomer = mockCustomers.find(
        (c) => c.phoneNumber === customerData.phoneNumber && c.id !== id
      );
      if (existingCustomer) {
        throw new Error("Customer with this phone number already exists");
      }
    }

    const updatedCustomer: Customer = {
      ...mockCustomers[customerIndex],
      ...customerData,
      modifiedAt: new Date().toISOString(),
    };

    mockCustomers[customerIndex] = updatedCustomer;
    return updatedCustomer;
  }

  static async deleteCustomer(id: string, storeId: string) {
    await delay(400);

    const customerIndex = mockCustomers.findIndex((c) => c.id === id);
    if (customerIndex === -1) {
      throw new Error("Customer not found");
    }

    // Remove customer from mock data (in real app, this would be a soft delete)
    mockCustomers.splice(customerIndex, 1);
    return { message: "Customer deleted successfully" };
  }
}
