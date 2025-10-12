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

// Validation Schemas for API endpoints
const purchaseRequestSchema = z.object({
  productId: z.string().uuid("Invalid product ID format"),
});

const depositInitializeSchema = z.object({
  amount: z.number()
    .int("Amount must be a whole number")
    .min(100, "Minimum deposit is ₦100")
    .max(1000000, "Maximum deposit is ₦1,000,000"),
});

const depositVerifySchema = z.object({
  reference: z.string().min(1, "Reference is required"),
  amount: z.number()
    .int("Amount must be a whole number")
    .positive("Amount must be positive"),
});

// Social media account validator
const socialMediaAccountValidator = z.object({
  accountUsername: z.string().min(1, "Account username is required"),
  accountPassword: z.string().min(1, "Account password is required"),
  accountEmail: z.string().email("Valid email is required").optional(),
});

// Enhanced product schema with social media validation
const adminProductSchema = insertProductSchema.merge(socialMediaAccountValidator);

// Middleware to verify admin API key (for legacy API endpoint)
const verifyAdminKey = (req: any, res: any, next: any) => {
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== ADMIN_API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API key" });
  }
  next();
};

// Middleware to check if authenticated user is admin
const isAdmin = async (req: any, res: any, next: any) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUser(userId);
    
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }
    
    next();
  } catch (error) {
    console.error("Error checking admin status:", error);
    res.status(500).json({ message: "Failed to verify admin status" });
  }
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

  // Secret admin endpoint to post products (Legacy - for API key access)
  app.post("/api/admin/products", verifyAdminKey, async (req, res) => {
    try {
      // Validate product data including social media account credentials
      const validatedData = adminProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid product data", 
          errors: error.errors 
        });
      }
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // Admin Dashboard Routes (Require authenticated admin user)
  app.get("/api/admin/stats", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const stats = await storage.getProductStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  app.get("/api/admin/all-products", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching all products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/admin/dashboard/products", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validatedData = adminProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid product data", 
          errors: error.errors 
        });
      }
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.patch("/api/admin/dashboard/products/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const productId = req.params.id;
      const validatedData = adminProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(productId, validatedData);
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid product data", 
          errors: error.errors 
        });
      }
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:id/admin-status", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      const { isAdmin: newAdminStatus } = req.body;
      
      if (typeof newAdminStatus !== "boolean") {
        return res.status(400).json({ message: "isAdmin must be a boolean" });
      }

      const user = await storage.updateUserAdminStatus(userId, newAdminStatus);
      res.json(user);
    } catch (error) {
      console.error("Error updating user admin status:", error);
      res.status(500).json({ message: "Failed to update user admin status" });
    }
  });

  // Purchase routes
  app.post("/api/purchases", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate request
      const validation = purchaseRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid purchase request", 
          errors: validation.error.errors 
        });
      }

      const { productId } = validation.data;

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

  // Validation schema for deposit verification
  const depositVerifySchema = z.object({
    reference: z.string().min(1),
    amount: z.number().positive().int(),
  });

  // Paystack webhook for deposit verification
  app.post("/api/deposits/verify", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate request body
      const validation = depositVerifySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid request data" });
      }
      
      const { reference, amount } = validation.data;

      // SECURITY: Verify that a pending transaction exists for THIS user with this reference
      const pendingTransaction = await storage.getPendingTransaction(userId, reference);
      if (!pendingTransaction) {
        return res.status(400).json({ 
          message: "Invalid transaction reference. Transaction not found or already completed." 
        });
      }

      // SECURITY: Verify the requested amount matches the pending transaction amount
      if (pendingTransaction.amount !== amount) {
        return res.status(400).json({ 
          message: "Amount mismatch with pending transaction" 
        });
      }

      // Verify payment with Paystack before processing
      const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
      if (!paystackSecretKey) {
        console.error("PAYSTACK_SECRET_KEY is not set");
        return res.status(500).json({ message: "Payment system not configured" });
      }

      const verifyUrl = `https://api.paystack.co/transaction/verify/${reference}`;
      const response = await fetch(verifyUrl, {
        headers: { Authorization: `Bearer ${paystackSecretKey}` }
      });
      const data = await response.json();
      
      if (!data.status || data.data.status !== 'success') {
        return res.status(400).json({ message: "Payment verification failed" });
      }

      // Verify amount matches (Paystack returns amount in kobo, so divide by 100)
      const verifiedAmount = data.data.amount / 100;
      if (verifiedAmount !== amount) {
        return res.status(400).json({ message: "Payment amount mismatch" });
      }

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
      
      // Validate request
      const validation = depositInitializeSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid deposit amount", 
          errors: validation.error.errors 
        });
      }

      const { amount } = validation.data;

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
