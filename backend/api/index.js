// api/index.js
import serverless from "serverless-http";
import express from "express";

const app = express();

// Optional: redirect root to API
app.get("/", (req, res) => {
  res.json({ message: "Backend is running" });
});

// Import your routes from server.js
import serverRoutes from "../server.js";
app.use(serverRoutes);

export const handler = serverless(app);
