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
import { eq, and, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations - Required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  incrementUserBalance(userId: string, amount: number): Promise<User>;

  // Product operations
  getAllProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  getAvailableProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProductStatus(id: string, status: string): Promise<void>;

  // Purchase operations
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  getUserPurchases(userId: string): Promise<(Purchase & { product: Product })[]>;
  getPurchaseWithProduct(purchaseId: string): Promise<(Purchase & { product: Product }) | undefined>;

  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: string): Promise<Transaction[]>;
  updateTransactionStatus(id: string, status: string): Promise<void>;

  // Atomic operations
  processPurchase(userId: string, productId: string): Promise<{
    success: boolean;
    message?: string;
    purchase?: Purchase;
    newBalance?: number;
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

  async updateProductStatus(id: string, status: string): Promise<void> {
    await db.update(products).set({ status }).where(eq(products.id, id));
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

      // Mark product as sold
      await tx
        .update(products)
        .set({ status: "sold" })
        .where(eq(products.id, productId));

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

  // Atomic deposit operation with idempotency
  async processDeposit(userId: string, reference: string, amount: number): Promise<{
    success: boolean;
    message?: string;
    transaction?: Transaction;
    newBalance?: number;
  }> {
    return await db.transaction(async (tx) => {
      // Check if reference already exists (idempotency)
      const [existingTx] = await tx
        .select()
        .from(transactions)
        .where(and(eq(transactions.reference, reference), eq(transactions.userId, userId)));

      if (existingTx && existingTx.status === "completed") {
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

      // Create or update transaction record
      const [transaction] = existingTx
        ? await tx
            .update(transactions)
            .set({ status: "completed" })
            .where(eq(transactions.id, existingTx.id))
            .returning()
        : await tx
            .insert(transactions)
            .values({
              userId,
              type: "deposit",
              amount,
              status: "completed",
              reference,
              metadata: { method: "paystack" },
            })
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
