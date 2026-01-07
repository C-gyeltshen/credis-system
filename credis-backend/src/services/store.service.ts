import { StoreRepository } from "../repositories/store.repository.js";
import type { CreateStoreInput } from "../types/store.types.js";

export class StoreService {
  private repository: StoreRepository;

  constructor() {
    this.repository = new StoreRepository();
  }

  async createStore(data: CreateStoreInput) {
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
}
