const dns = require("dns");
const authRoutes = require("./routes/authRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const menuItemRoutes = require("./routes/menuItemRoutes");
const orderRoutes = require("./routes/orderRoutes");


dns.setServers([
  "8.8.8.8",
  "1.1.1.1"
]);

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);

app.use("/api/restaurants", restaurantRoutes);
app.use("/api/menu-items", menuItemRoutes);

app.use("/api/orders", orderRoutes);

connectDB();

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FOODIE Backend is running!",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`FOODIE Backend running on port ${PORT}`);
});