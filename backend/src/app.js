const express = require("express");
const path = require("path");
const { initializeDatabase } = require("./db");
const repositoryRoutes = require("./routes/repositories");
const secretRoutes = require("./routes/secrets");

const app = express();

initializeDatabase();

app.use(express.json());
app.use(express.static(path.join(__dirname, "../../frontend")));

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "DC Megatron backend is running",
  });
});

app.use("/repositories", repositoryRoutes);
app.use("/secrets", secretRoutes);

app.listen(3000, () => {
  console.log("Backend server is running on http://localhost:3000");
});