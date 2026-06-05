import "dotenv/config";
import express from "express";
import { handleDemo } from "./routes/demo";
import { handleFinalizeCredential } from "./routes/finalize-credential";
import { handleVisitScheduling } from "./routes/visit-scheduling";

export function createServer() {
  const app = express();
  app.disable("x-powered-by");

  // Middleware
  app.use((_req, res, next) => {
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    next();
  });
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  app.post("/api/finalize-credential", handleFinalizeCredential);
  app.post("/api/visit-scheduling", handleVisitScheduling);

  return app;
}
