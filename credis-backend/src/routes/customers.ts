import { Hono } from "hono";
import { prisma } from "../../lib/prisma.js";

export const customersRouter = new Hono();

// Create a new customer
customersRouter.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const {
      storeId,
      name,
      phoneNumber,
      address,
      email,
      cidNumber,
      creditLimit,
    } = body;

    // Validate required fields
    if (!storeId || !name || !phoneNumber) {
      return c.json(
        { error: "Store ID, name, and phone number are required" },
        400
      );
    }

    // Check if customer with same phone number already exists in this store
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        storeId,
        phoneNumber,
      },
    });

    if (existingCustomer) {
      return c.json(
        {
          error: "Customer with this phone number already exists in this store",
        },
        409
      );
    }

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        storeId,
        name,
        phoneNumber,
        address: address || null,
        email: email || null,
        cidNumber: cidNumber || null,
        creditLimit: creditLimit ? parseFloat(creditLimit) : null,
      },
    });

    return c.json(customer, 201);
  } catch (error) {
    console.error("Error creating customer:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get all customers for a store with optional search
customersRouter.get("/", async (c) => {
  try {
    const storeId = c.req.query("storeId");
    const search = c.req.query("search");
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "10");
    const skip = (page - 1) * limit;

    if (!storeId) {
      return c.json({ error: "Store ID is required" }, 400);
    }

    const whereCondition: any = {
      storeId,
      isActive: true,
    };

    // Add search functionality
    if (search) {
      whereCondition.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phoneNumber: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { cidNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    const [customers, totalCount] = await Promise.all([
      prisma.customer.findMany({
        where: whereCondition,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.customer.count({
        where: whereCondition,
      }),
    ]);

    return c.json({
      customers,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get a single customer by ID
customersRouter.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const storeId = c.req.query("storeId");

    if (!storeId) {
      return c.json({ error: "Store ID is required" }, 400);
    }

    const customer = await prisma.customer.findFirst({
      where: {
        id,
        storeId,
        isActive: true,
      },
    });

    if (!customer) {
      return c.json({ error: "Customer not found" }, 404);
    }

    return c.json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Update a customer
customersRouter.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const {
      storeId,
      name,
      phoneNumber,
      address,
      email,
      cidNumber,
      creditLimit,
    } = body;

    if (!storeId) {
      return c.json({ error: "Store ID is required" }, 400);
    }

    // Check if customer exists
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id,
        storeId,
        isActive: true,
      },
    });

    if (!existingCustomer) {
      return c.json({ error: "Customer not found" }, 404);
    }

    // Check if phone number is being changed and if it conflicts with another customer
    if (phoneNumber && phoneNumber !== existingCustomer.phoneNumber) {
      const phoneConflict = await prisma.customer.findFirst({
        where: {
          storeId,
          phoneNumber,
          id: { not: id },
        },
      });

      if (phoneConflict) {
        return c.json(
          {
            error:
              "Customer with this phone number already exists in this store",
          },
          409
        );
      }
    }

    // Update customer
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(phoneNumber && { phoneNumber }),
        ...(address !== undefined && { address }),
        ...(email !== undefined && { email }),
        ...(cidNumber !== undefined && { cidNumber }),
        ...(creditLimit !== undefined && {
          creditLimit: creditLimit ? parseFloat(creditLimit) : null,
        }),
      },
    });

    return c.json(customer);
  } catch (error) {
    console.error("Error updating customer:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Soft delete a customer
customersRouter.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const storeId = c.req.query("storeId");

    if (!storeId) {
      return c.json({ error: "Store ID is required" }, 400);
    }

    // Check if customer exists
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id,
        storeId,
        isActive: true,
      },
    });

    if (!existingCustomer) {
      return c.json({ error: "Customer not found" }, 404);
    }

    // Soft delete customer
    const customer = await prisma.customer.update({
      where: { id },
      data: { isActive: false },
    });

    return c.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
