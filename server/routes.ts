import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";
import { insertProductSchema, insertPurchaseSchema, insertTransactionSchema } from "@shared/schema";

// Secret API key for admin product posting - REQUIRED
if (!process.env.ADMIN_API_KEY) {
  throw new Error("ADMIN_API_KEY environment variable is required for security");
}
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

// Middleware to verify admin API key
const verifyAdminKey = (req: any, res: any, next: any) => {
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== ADMIN_API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API key" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAvailableProducts();
      // Remove sensitive credentials from public listing
      const sanitizedProducts = products.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        price: p.price,
        category: p.category,
        images: p.images,
        status: p.status,
        createdAt: p.createdAt,
      }));
      res.json(sanitizedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", isAuthenticated, async (req, res) => {
    try {
      const product = await storage.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      // Remove credentials from details view
      const { accountUsername, accountPassword, accountEmail, ...sanitizedProduct } = product;
      res.json(sanitizedProduct);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Secret admin endpoint to post products
  app.post("/api/admin/products", verifyAdminKey, async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // Purchase routes
  app.post("/api/purchases", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { productId } = req.body;

      // Atomic purchase transaction
      const result = await storage.processPurchase(userId, productId);
      
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      res.status(201).json({
        purchase: result.purchase,
        newBalance: result.newBalance,
      });
    } catch (error) {
      console.error("Error creating purchase:", error);
      res.status(500).json({ message: "Failed to complete purchase" });
    }
  });

  app.get("/api/purchases", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const purchases = await storage.getUserPurchases(userId);
      
      // Include full credentials for purchased items
      const purchasesWithCredentials = purchases.map((p) => ({
        ...p,
        product: {
          ...p.product,
          accountUsername: p.product.accountUsername,
          accountPassword: p.product.accountPassword,
          accountEmail: p.product.accountEmail,
          additionalInfo: p.product.additionalInfo,
        },
      }));

      res.json(purchasesWithCredentials);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      res.status(500).json({ message: "Failed to fetch purchases" });
    }
  });

  // Transaction/Deposit routes
  app.get("/api/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Paystack webhook for deposit verification
  app.post("/api/deposits/verify", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { reference, amount } = req.body;

      // TODO: Implement server-side Paystack verification
      // const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
      // const verifyUrl = `https://api.paystack.co/transaction/verify/${reference}`;
      // const response = await fetch(verifyUrl, {
      //   headers: { Authorization: `Bearer ${paystackSecretKey}` }
      // });
      // const data = await response.json();
      // if (!data.status || data.data.status !== 'success') {
      //   return res.status(400).json({ message: "Payment verification failed" });
      // }

      // Process deposit atomically with idempotency check
      const result = await storage.processDeposit(userId, reference, amount);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      res.json({
        transaction: result.transaction,
        newBalance: result.newBalance,
      });
    } catch (error) {
      console.error("Error verifying deposit:", error);
      res.status(500).json({ message: "Failed to verify deposit" });
    }
  });

  // Initialize deposit (generate Paystack reference)
  app.post("/api/deposits/initialize", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { amount } = req.body;

      // Validate amount
      if (amount < 100 || amount > 1000000) {
        return res.status(400).json({ message: "Amount must be between ₦100 and ₦1,000,000" });
      }

      // Create pending transaction
      const transaction = await storage.createTransaction({
        userId,
        type: "deposit",
        amount,
        status: "pending",
        reference: `DEP-${Date.now()}-${userId}`,
        metadata: { method: "paystack" },
      });

      // Return transaction details for Paystack initialization
      res.json({
        reference: transaction.reference,
        amount: transaction.amount,
      });
    } catch (error) {
      console.error("Error initializing deposit:", error);
      res.status(500).json({ message: "Failed to initialize deposit" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
