import {
  users,
  products,
  purchases,
  transactions,
  type User,
  type UpsertUser,
  type Product,
  type InsertProduct,
  type Purchase,
  type InsertPurchase,
  type Transaction,
  type InsertTransaction,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations - Required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  incrementUserBalance(userId: string, amount: number): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserAdminStatus(userId: string, isAdmin: boolean): Promise<User>;

  // Product operations
  getAllProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  getAvailableProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  updateProductStatus(id: string, status: string): Promise<void>;
  getProductStats(): Promise<{ total: number; available: number; sold: number }>;

  // Purchase operations
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  getUserPurchases(userId: string): Promise<(Purchase & { product: Product })[]>;
  getPurchaseWithProduct(purchaseId: string): Promise<(Purchase & { product: Product }) | undefined>;

  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: string): Promise<Transaction[]>;
  updateTransactionStatus(id: string, status: string): Promise<void>;
  getPendingTransaction(userId: string, reference: string): Promise<Transaction | undefined>;

  // Atomic operations
  processPurchase(userId: string, productId: string): Promise<{
    success: boolean;
    message?: string;
    purchase?: Purchase;
    newBalance?: number;
  }>;
  processBulkPurchase(userId: string, productIds: string[]): Promise<{
    success: boolean;
    message?: string;
    purchases?: Purchase[];
    newBalance?: number;
    successCount?: number;
    failedProducts?: string[];
  }>;
  processDeposit(userId: string, reference: string, amount: number): Promise<{
    success: boolean;
    message?: string;
    transaction?: Transaction;
    newBalance?: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async incrementUserBalance(userId: string, amount: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ walletBalance: sql`${users.walletBalance} + ${amount}` })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserAdminStatus(userId: string, isAdmin: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isAdmin })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Product operations
  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getAvailableProducts(): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.status, "available"))
      .orderBy(desc(products.createdAt));
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(productData).returning();
    return product;
  }

  async updateProduct(id: string, productData: Partial<InsertProduct>): Promise<Product> {
    const [product] = await db
      .update(products)
      .set(productData)
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async updateProductStatus(id: string, status: string): Promise<void> {
    await db.update(products).set({ status }).where(eq(products.id, id));
  }

  async getProductStats(): Promise<{ total: number; available: number; sold: number }> {
    const allProducts = await db.select().from(products);
    const total = allProducts.length;
    const available = allProducts.filter((p) => p.status === "available").length;
    const sold = allProducts.filter((p) => p.status === "sold").length;
    return { total, available, sold };
  }

  // Purchase operations
  async createPurchase(purchaseData: InsertPurchase): Promise<Purchase> {
    const [purchase] = await db.insert(purchases).values(purchaseData).returning();
    return purchase;
  }

  async getUserPurchases(userId: string): Promise<(Purchase & { product: Product })[]> {
    const results = await db
      .select()
      .from(purchases)
      .leftJoin(products, eq(purchases.productId, products.id))
      .where(eq(purchases.userId, userId))
      .orderBy(desc(purchases.purchasedAt));

    return results.map((row) => ({
      ...row.purchases,
      product: row.products!,
    }));
  }

  async getPurchaseWithProduct(purchaseId: string): Promise<(Purchase & { product: Product }) | undefined> {
    const results = await db
      .select()
      .from(purchases)
      .leftJoin(products, eq(purchases.productId, products.id))
      .where(eq(purchases.id, purchaseId));

    if (results.length === 0) return undefined;

    return {
      ...results[0].purchases,
      product: results[0].products!,
    };
  }

  // Transaction operations
  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values(transactionData).returning();
    return transaction;
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  async updateTransactionStatus(id: string, status: string): Promise<void> {
    await db.update(transactions).set({ status }).where(eq(transactions.id, id));
  }

  async getPendingTransaction(userId: string, reference: string): Promise<Transaction | undefined> {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.reference, reference),
          eq(transactions.status, "pending")
        )
      );
    return transaction;
  }

  // Atomic purchase operation with proper transaction handling
  async processPurchase(userId: string, productId: string): Promise<{
    success: boolean;
    message?: string;
    purchase?: Purchase;
    newBalance?: number;
  }> {
    return await db.transaction(async (tx) => {
      // Get user and product within transaction
      const [user] = await tx.select().from(users).where(eq(users.id, userId));
      const [product] = await tx.select().from(products).where(eq(products.id, productId));

      if (!user) {
        return { success: false, message: "User not found" };
      }

      if (!product) {
        return { success: false, message: "Product not found" };
      }

      if (product.status !== "available") {
        return { success: false, message: "Product not available" };
      }

      if (user.walletBalance < product.price) {
        return { success: false, message: "Insufficient wallet balance" };
      }

      // CRITICAL: Mark product as sold with conditional update to prevent race conditions
      // Only update if status is still "available" - this prevents double purchases
      const updatedProducts = await tx
        .update(products)
        .set({ status: "sold" })
        .where(and(eq(products.id, productId), eq(products.status, "available")))
        .returning();

      // If no rows were updated, another transaction already purchased this product
      if (updatedProducts.length === 0) {
        return { success: false, message: "Product was just purchased by another user" };
      }

      // Deduct from wallet atomically
      const [updatedUser] = await tx
        .update(users)
        .set({ walletBalance: sql`${users.walletBalance} - ${product.price}` })
        .where(eq(users.id, userId))
        .returning();

      // Create purchase record
      const [purchase] = await tx
        .insert(purchases)
        .values({
          userId,
          productId,
          amount: product.price,
        })
        .returning();

      // Create transaction record
      await tx.insert(transactions).values({
        userId,
        type: "purchase",
        amount: -product.price,
        status: "completed",
        reference: purchase.id,
        metadata: { productId, productTitle: product.title },
      });

      return {
        success: true,
        purchase,
        newBalance: updatedUser.walletBalance,
      };
    });
  }

  // Atomic bulk purchase operation
  async processBulkPurchase(userId: string, productIds: string[]): Promise<{
    success: boolean;
    message?: string;
    purchases?: Purchase[];
    newBalance?: number;
    successCount?: number;
    failedProducts?: string[];
  }> {
    return await db.transaction(async (tx) => {
      // Get user
      const [user] = await tx.select().from(users).where(eq(users.id, userId));

      if (!user) {
        return { success: false, message: "User not found" };
      }

      // Get all products
      const productsToFetch = await tx
        .select()
        .from(products)
        .where(sql`${products.id} = ANY(${productIds})`);

      if (productsToFetch.length === 0) {
        return { success: false, message: "No valid products found" };
      }

      // Filter available products
      const availableProducts = productsToFetch.filter((p) => p.status === "available");
      
      if (availableProducts.length === 0) {
        return { success: false, message: "None of the selected products are available" };
      }

      // Calculate total price
      const totalPrice = availableProducts.reduce((sum, p) => sum + p.price, 0);

      if (user.walletBalance < totalPrice) {
        return { 
          success: false, 
          message: `Insufficient wallet balance. Required: ₦${totalPrice.toLocaleString()}, Available: ₦${user.walletBalance.toLocaleString()}` 
        };
      }

      const purchaseRecords: Purchase[] = [];
      const successfulProductIds: string[] = [];

      // Process each product
      for (const product of availableProducts) {
        // Mark product as sold with conditional update
        const updatedProducts = await tx
          .update(products)
          .set({ status: "sold" })
          .where(and(eq(products.id, product.id), eq(products.status, "available")))
          .returning();

        if (updatedProducts.length > 0) {
          // Create purchase record
          const [purchase] = await tx
            .insert(purchases)
            .values({
              userId,
              productId: product.id,
              amount: product.price,
            })
            .returning();

          purchaseRecords.push(purchase);
          successfulProductIds.push(product.id);

          // Create transaction record
          await tx.insert(transactions).values({
            userId,
            type: "purchase",
            amount: -product.price,
            status: "completed",
            reference: purchase.id,
            metadata: { productId: product.id, productTitle: product.title },
          });
        }
      }

      if (successfulProductIds.length === 0) {
        return { success: false, message: "All products were already purchased by others" };
      }

      // Deduct total from wallet atomically
      const totalDeduction = purchaseRecords.reduce((sum, p) => sum + p.amount, 0);
      const [updatedUser] = await tx
        .update(users)
        .set({ walletBalance: sql`${users.walletBalance} - ${totalDeduction}` })
        .where(eq(users.id, userId))
        .returning();

      // Identify failed products
      const failedProductIds = productIds.filter((id) => !successfulProductIds.includes(id));

      return {
        success: true,
        purchases: purchaseRecords,
        newBalance: updatedUser.walletBalance,
        successCount: successfulProductIds.length,
        failedProducts: failedProductIds.length > 0 ? failedProductIds : undefined,
      };
    });
  }

  // Atomic deposit operation with idempotency
  async processDeposit(userId: string, reference: string, amount: number): Promise<{
    success: boolean;
    message?: string;
    transaction?: Transaction;
    newBalance?: number;
  }> {
    return await db.transaction(async (tx) => {
      // Check if a pending transaction exists for this user and reference
      const [existingTx] = await tx
        .select()
        .from(transactions)
        .where(and(eq(transactions.reference, reference), eq(transactions.userId, userId)));

      // SECURITY: Reject if no transaction exists (prevents reference replay attacks)
      if (!existingTx) {
        return {
          success: false,
          message: "Invalid transaction reference",
        };
      }

      // Check if already completed (idempotency)
      if (existingTx.status === "completed") {
        return {
          success: false,
          message: "Deposit already processed",
        };
      }

      const [user] = await tx.select().from(users).where(eq(users.id, userId));

      if (!user) {
        return { success: false, message: "User not found" };
      }

      // Increment wallet balance atomically
      const [updatedUser] = await tx
        .update(users)
        .set({ walletBalance: sql`${users.walletBalance} + ${amount}` })
        .where(eq(users.id, userId))
        .returning();

      // Update transaction to completed
      const [transaction] = await tx
        .update(transactions)
        .set({ status: "completed" })
        .where(eq(transactions.id, existingTx.id))
        .returning();

      return {
        success: true,
        transaction,
        newBalance: updatedUser.walletBalance,
      };
    });
  }
}

export const storage = new DatabaseStorage();
