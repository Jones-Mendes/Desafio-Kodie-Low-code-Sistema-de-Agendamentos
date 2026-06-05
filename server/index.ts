import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleFinalizeCredential } from "./routes/finalize-credential";
import { handleVisitScheduling } from "./routes/visit-scheduling";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
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
