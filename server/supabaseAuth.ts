import { createClient } from "@supabase/supabase-js";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be set");
}

// Client for public operations (sign in, sign up)
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Admin client for server-side user verification (requires service role key)
const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  : null;

// Helper to sync Supabase user with local database
async function syncUser(supabaseUser: any) {
  const ADMIN_EMAILS = ["ighanghangodspower@gmail.com"];
  const isAdmin = ADMIN_EMAILS.includes(supabaseUser.email);

  const user = await storage.upsertUser({
    id: supabaseUser.id,
    email: supabaseUser.email,
    firstName: supabaseUser.user_metadata?.first_name || supabaseUser.email?.split("@")[0] || "",
    lastName: supabaseUser.user_metadata?.last_name || "",
    profileImageUrl: supabaseUser.user_metadata?.avatar_url || "",
  });

  // Always ensure protected admin emails maintain admin status
  if (isAdmin && !user.isAdmin) {
    await storage.updateUserAdminStatus(user.id, true);
  }

  return user;
}

export async function setupSupabaseAuth(app: Express) {
  // Sign up endpoint
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      if (data.user) {
        await syncUser(data.user);
      }

      res.json({
        user: data.user,
        session: data.session,
        message: "Please check your email to confirm your account",
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Failed to sign up" });
    }
  });

  // Sign in endpoint
  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = req.body;

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return res.status(401).json({ message: error.message });
      }

      if (data.user) {
        await syncUser(data.user);
      }

      res.json({
        user: data.user,
        session: data.session,
      });
    } catch (error) {
      console.error("Signin error:", error);
      res.status(500).json({ message: "Failed to sign in" });
    }
  });

  // Sign out endpoint - client handles this directly
  app.post("/api/auth/signout", async (req, res) => {
    // Client-side Supabase handles sign out
    // This endpoint just acknowledges the request
    res.json({ message: "Signed out successfully" });
  });

  // Get current user endpoint
  app.get("/api/auth/user", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(" ")[1];

      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      if (!supabaseAdmin) {
        console.error("SUPABASE_SERVICE_ROLE_KEY not configured");
        return res.status(500).json({ message: "Auth service not properly configured" });
      }

      // Verify token using admin client for proper server-side validation
      const { data: { user: supabaseUser }, error } = await supabaseAdmin.auth.getUser(token);

      if (error || !supabaseUser) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      // Sync with local database
      const user = await syncUser(supabaseUser);

      res.json(user);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Password reset request
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email } = req.body;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${req.protocol}://${req.get("host")}/reset-password`,
      });

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      res.json({ message: "Password reset email sent" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to send reset email" });
    }
  });

  // Update password - requires admin client
  app.post("/api/auth/update-password", async (req, res) => {
    try {
      const { password } = req.body;
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(" ")[1];

      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      if (!supabaseAdmin) {
        return res.status(500).json({ message: "Auth service not properly configured" });
      }

      // Verify user first
      const { data: { user }, error: verifyError } = await supabaseAdmin.auth.getUser(token);
      
      if (verifyError || !user) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      // Update password using admin client
      const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, { password });

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Update password error:", error);
      res.status(500).json({ message: "Failed to update password" });
    }
  });
}

// Middleware to verify Supabase JWT token using admin client
export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    if (!supabaseAdmin) {
      console.error("SUPABASE_SERVICE_ROLE_KEY not configured - auth will fail");
      return res.status(500).json({ message: "Auth service not properly configured" });
    }

    // Verify token using admin client for proper server-side validation
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Attach user to request
    req.user = { id: user.id, email: user.email };
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Authentication failed" });
  }
};
