export interface CreateStoreOwnerInput {
  name: string;
  email: string;
  password: string;
  storeId?: string;
}

export interface UpdateStoreOwnerInput {
  name?: string;
  email?: string;
  passwordHash?: string;
  storeId?: string;
  isActive?: boolean;
  lastLoginAt?: Date;
}

export interface StoreOwner {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  storeId?: string | null;
  isActive: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
  modifiedAt: Date;
}

// Response types (without sensitive data)
export interface StoreOwnerResponse {
  id: string;
  name: string;
  email: string;
  storeId?: string | null;
  isActive: boolean;
  createdAt: Date;
}

export interface AuthResponse {
  success: boolean;
  user: StoreOwnerResponse;
}