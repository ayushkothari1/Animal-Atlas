import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import animalsRouter from "./routes/animals.js";

const app = express();

const PORT = process.env.PORT || 8787;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, "../dist");

app.use(cors());
app.use(express.json());

// /
//  API
//  /
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Animal Atlas API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/animals", animalsRouter);

//  React frontend

app.use(express.static(distPath));

/*
 * Send React app for frontend routes
 */
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }

  res.sendFile(path.join(distPath, "index.html"));
});

//
//   Start server
//
app.listen(PORT, () => {
  console.log(`Animal Atlas API running on port ${PORT}`);
});
