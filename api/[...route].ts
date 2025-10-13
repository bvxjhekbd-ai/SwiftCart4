import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

let routesRegistered = false;

export default async function handler(req: Request, res: Response) {
  try {
    if (!routesRegistered) {
      await registerRoutes(app);
      
      app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        res.status(status).json({ message });
      });
      
      routesRegistered = true;
    }

    app(req, res);
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : "Internal Server Error" 
    });
  }
}
