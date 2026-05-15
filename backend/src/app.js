const express = require("express");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "DC Megatron backend is running",
  });
});

app.listen(3000, () => {
  console.log("Backend server is running on http://localhost:3000");
});