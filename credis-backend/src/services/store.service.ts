import { StoreRepository } from "../repositories/store.repository.js";
import type { CreateStoreInput } from "../types/store.types.js";

export class StoreService {
  private repository: StoreRepository;

  constructor() {
    this.repository = new StoreRepository();
  }

  async createStore(data: CreateStoreInput) {
    // Business logic: Check if store with phone number already exists
    if (data.phone_number) {
      const existingStore = await this.repository.findByPhoneNumber(
        data.phone_number
      );

      if (existingStore) {
        throw new Error("Store with this phone number already exists");
      }
    }

    // Create store
    const store = await this.repository.create(data);

    return store;
  }

  async getStore(id: string) {
    const store = await this.repository.findById(id);

    if (!store) {
      throw new Error("Store not found");
    }

    return store;
  }

  async getAllStores() {
    return await this.repository.findAll();
  }

  async updateStore(id: string, data: Partial<CreateStoreInput>) {
    // Check if store exists
    const existingStore = await this.repository.findById(id);

    if (!existingStore) {
      throw new Error("Store not found");
    }

    // Business logic: Check if phone number is being changed to one that already exists
    if (data.phone_number && data.phone_number !== existingStore.phoneNumber) {
      const storeWithPhone = await this.repository.findByPhoneNumber(
        data.phone_number
      );

      if (storeWithPhone) {
        throw new Error("Store with this phone number already exists");
      }
    }

    // Update store
    const updatedStore = await this.repository.update(id, data);

    return updatedStore;
  }

  async deleteStore(id: string) {
    // Check if store exists
    const existingStore = await this.repository.findById(id);

    if (!existingStore) {
      throw new Error("Store not found");
    }

    // Delete store
    await this.repository.delete(id);

    return { message: "Store deleted successfully" };
  }

  async getStoreWithCustomers(id: string) {
    const store = await this.repository.findWithCustomers(id);

    if (!store) {
      throw new Error("Store not found");
    }

    return store;
  }

  async getStoreWithOwners(id: string) {
    const store = await this.repository.findWithOwners(id);

    if (!store) {
      throw new Error("Store not found");
    }

    return store;
  }

  async getStoreWithCustomersAndOwners(id: string) {
    const store = await this.repository.findWithCustomersAndOwners(id);

    if (!store) {
      throw new Error("Store not found");
    }

    return store;
  }
}
