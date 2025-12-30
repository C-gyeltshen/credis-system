export interface CreateCustomerInput {
    storeId: string;
    name: string;
    phone_number: string;
}

export interface CustomerResponse {
    id: string;
    name: string;
    phone_number: string;
    createdAt: Date;
    updatedAt: Date;
}
