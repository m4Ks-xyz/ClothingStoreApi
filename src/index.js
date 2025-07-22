const express = require("express");

const cors = require("cors");

const app = express();

const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
}

app.use(express.json());
app.use(cors(corsOptions));

app.get("/", (req, res) => {
  return res.status(200).send({ message: "Welcome to ClothStore API" });
});

const authRoutes = require("./routes/auth.routes.js");
app.use("/auth", authRoutes);

const userRoutes = require("./routes/user.routes.js");
app.use("/api/users", userRoutes);

const productRoutes = require("./routes/product.routes.js");
app.use("/api/products", productRoutes);

const adminProductRouter = require("./routes/admin-products.routes.js");
app.use("/api/admin/products", adminProductRouter);

const cartRouter = require("./routes/cart.routes.js");
app.use("/api/cart", cartRouter);

const cartItemRouter = require("./routes/cart-item.routes.js");
app.use("/api/cart-item", cartItemRouter);

const orderRouter = require("./routes/order.routes.js");
app.use("/api/orders", orderRouter);

const adminOrderRouter = require("./routes/admin-order.routes.js");
app.use("/api/admin/orders", adminOrderRouter);

const reviewRouter = require("./routes/review.routes.js");
app.use("/api/reviews", reviewRouter);




module.exports = app;

