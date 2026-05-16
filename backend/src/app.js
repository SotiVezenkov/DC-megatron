const express = require("express");
const { initializeDatabase } = require("./db");
const repositoryRoutes = require("./routes/repositories");

const app = express();

initializeDatabase();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "DC Megatron backend is running",
  });
});

app.use("/repositories", repositoryRoutes);

app.listen(3000, () => {
  console.log("Backend server is running on http://localhost:3000");
});