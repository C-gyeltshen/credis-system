// Input type for creating a StoreOwner
export interface CreateStoreOwnerInput {
    name: string;
    email: string;
    password: string;
    storeId?: string; 
}

// Input type for updating a StoreOwner
export interface UpdateStoreOwnerInput {
    name?: string;
    email?: string;
    passwordHash?: string;
    storeId?: string;
    isActive?: boolean;
    lastLoginAt?: Date;
}

// StoreOwner response type (matches Prisma model)
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
