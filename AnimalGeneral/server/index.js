import express from "express";
import cors from "cors";

import animalsRouter from "./routes/animals.js";

const app = express();

const PORT = process.env.PORT || 8787;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Animal Atlas API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/animals", animalsRouter);

app.listen(PORT, () => {
  console.log(`Animal Atlas API running on http://localhost:${PORT}`);
});
