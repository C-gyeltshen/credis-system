```prisma 
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// MeOpen1234567CHIMI

// =====================================================
// TENANTS (Store Owners)
// =====================================================

model StoreOwner {
  id             Int          @id @default(autoincrement())
  storeName      String       @unique
  ownerName      String
  email          String       @unique
  password       String
  phoneNumber    String       @unique
  storeSubdomain String?      @unique
  status         TenantStatus @default(ACTIVE)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  // Relations
  products       Product[]
  customers      Customer[]
  orders         Order[]
  orderItems     OrderItem[]
  shoppingCarts  ShoppingCart[]
  cartItems      CartItem[]
  storeSettings  StoreSettings?
  categories     Category[]
  productReviews ProductReview[]
  activityLogs   ActivityLog[]

  @@index([storeName])
  @@index([storeSubdomain])
  @@index([status])
  @@map("tenants")
}

enum TenantStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

// =====================================================
// PRODUCTS
// =====================================================

model Product {
  id              Int      @id @default(autoincrement())
  tenantId        Int
  productName     String
  description     String?
  price           Decimal  @db.Decimal(10, 2)
  stockQuantity   Int      @default(0)
  sku             String?
  category        String?
  productImageUrl String?
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  tenant         StoreOwner      @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  orderItems     OrderItem[]
  cartItems      CartItem[]
  productReviews ProductReview[]

  @@unique([tenantId, sku])
  @@index([tenantId])
  @@index([productName])
  @@index([category])
  @@map("products")
}

// =====================================================
// CUSTOMERS
// =====================================================

model Customer {
  id           Int      @id @default(autoincrement())
  tenantId     Int
  customerName String
  email        String?
  phoneNumber  String?
  address      String?
  city         String?
  state        String?
  postalCode   String?
  country      String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relations
  tenant         StoreOwner      @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  orders         Order[]
  shoppingCarts  ShoppingCart[]
  productReviews ProductReview[]

  @@index([tenantId])
  @@index([email])
  @@index([customerName])
  @@map("customers")
}

// =====================================================
// ORDERS
// =====================================================

model Order {
  id                   Int           @id @default(autoincrement())
  tenantId             Int
  customerId           Int
  orderNumber          String
  totalAmount          Decimal       @db.Decimal(10, 2)
  orderStatus          OrderStatus   @default(PENDING)
  paymentStatus        PaymentStatus @default(PENDING)
  paymentScreenshotUrl String?
  customerNotes        String?
  createdAt            DateTime      @default(now())
  updatedAt            DateTime      @updatedAt

  // Relations
  tenant     StoreOwner  @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  customer   Customer    @relation(fields: [customerId], references: [id], onDelete: Cascade)
  orderItems OrderItem[]

  @@unique([tenantId, orderNumber])
  @@index([tenantId])
  @@index([customerId])
  @@index([orderNumber])
  @@index([orderStatus])
  @@index([paymentStatus])
  @@index([createdAt])
  @@map("orders")
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

enum PaymentStatus {
  PENDING
  RECEIVED
  FAILED
}

// =====================================================
// ORDER ITEMS
// =====================================================

model OrderItem {
  id         Int      @id @default(autoincrement())
  orderId    Int
  productId  Int
  tenantId   Int
  quantity   Int
  unitPrice  Decimal  @db.Decimal(10, 2)
  totalPrice Decimal  @db.Decimal(10, 2)
  createdAt  DateTime @default(now())

  // Relations
  order   Order      @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product Product    @relation(fields: [productId], references: [id], onDelete: Restrict)
  tenant  StoreOwner @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([orderId])
  @@index([productId])
  @@index([tenantId])
  @@map("order_items")
}

// =====================================================
// SHOPPING CART
// =====================================================

model ShoppingCart {
  id         Int      @id @default(autoincrement())
  tenantId   Int
  customerId Int?
  sessionId  String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  // Relations
  tenant    StoreOwner @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  customer  Customer?  @relation(fields: [customerId], references: [id], onDelete: Cascade)
  cartItems CartItem[]

  @@index([tenantId])
  @@index([sessionId])
  @@index([customerId])
  @@map("shopping_cart")
}

// =====================================================
// CART ITEMS
// =====================================================

model CartItem {
  id        Int      @id @default(autoincrement())
  cartId    Int
  productId Int
  tenantId  Int
  quantity  Int      @default(1)
  addedAt   DateTime @default(now())

  // Relations
  cart    ShoppingCart @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product Product      @relation(fields: [productId], references: [id], onDelete: Cascade)
  tenant  StoreOwner   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([cartId])
  @@index([productId])
  @@index([tenantId])
  @@map("cart_items")
}

// =====================================================
// STORE SETTINGS
// =====================================================

model StoreSettings {
  id               Int      @id @default(autoincrement())
  tenantId         Int      @unique
  storeDescription String?
  storeLogoUrl     String?
  storeBannerUrl   String?
  currency         String   @default("USD")
  taxPercentage    Decimal  @default(0) @db.Decimal(5, 2)
  shippingEnabled  Boolean  @default(false)
  shippingCost     Decimal? @db.Decimal(10, 2)
  contactEmail     String?
  contactPhone     String?
  address          String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  // Relations
  tenant StoreOwner @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId])
  @@map("store_settings")
}

// =====================================================
// CATEGORIES
// =====================================================

model Category {
  id               Int      @id @default(autoincrement())
  tenantId         Int
  categoryName     String
  description      String?
  categoryImageUrl String?
  isActive         Boolean  @default(true)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  // Relations
  tenant StoreOwner @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, categoryName])
  @@index([tenantId])
  @@map("categories")
}

// =====================================================
// PRODUCT REVIEWS
// =====================================================

model ProductReview {
  id         Int      @id @default(autoincrement())
  productId  Int
  tenantId   Int
  customerId Int?
  rating     Int
  reviewText String?
  isApproved Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  // Relations
  product  Product    @relation(fields: [productId], references: [id], onDelete: Cascade)
  tenant   StoreOwner @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  customer Customer?  @relation(fields: [customerId], references: [id], onDelete: SetNull)

  @@index([productId])
  @@index([tenantId])
  @@index([customerId])
  @@map("product_reviews")
}

// =====================================================
// ACTIVITY LOGS (Audit Trail)
// =====================================================

model ActivityLog {
  id          Int      @id @default(autoincrement())
  tenantId    Int
  actionType  String
  entityType  String?
  entityId    Int?
  description String?
  userType    UserType @default(SYSTEM)
  createdAt   DateTime @default(now())

  // Relations
  tenant StoreOwner @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId])
  @@index([actionType])
  @@index([createdAt])
  @@map("activity_logs")
}

enum UserType {
  STORE_OWNER
  CUSTOMER
  SYSTEM
}

```