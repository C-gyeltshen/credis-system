export interface CreateCustomerInput {
    storeId: string;
    name: string;
    phone_number: string;
    email: string;
    creditLimit?: number;
}

export interface CustomerResponse {
    id: string;
    name: string;
    email: string;
    phone_number: string;
    creditLimit: number;
    createdAt: Date;
    updatedAt: Date;
}
