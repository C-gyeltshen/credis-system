export interface CreateStoreInput{
    name: string;
    address: string;
    phone_number: string;
}

export interface StoreResponse{
    id: string;
    name: string;
    address: string;
    phone_number: string;
    creditLimit: number;
    createdAt: Date;
    updatedAt: Date;
}