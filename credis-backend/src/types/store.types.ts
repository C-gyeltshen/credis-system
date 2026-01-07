export interface CreateStoreInput{
    name: string;
}

export interface StoreResponse{
    id: string;
    name: string;
    creditLimit: number;
    createdAt: Date;
    updatedAt: Date;
}