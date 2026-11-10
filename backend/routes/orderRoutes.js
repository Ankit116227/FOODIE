const express = require("express");
const mongoose = require("mongoose");

const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Create Order - Jobseeker/User Only
router.post(
  "/",
  authMiddleware,
  roleMiddleware("customer"),
  async (req, res) => {
    try {
      const { restaurant, items } = req.body;

      // Basic validation
      if (!restaurant || !items || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Restaurant and items are required",
        });
      }

      // Check valid restaurant ID
      if (!mongoose.Types.ObjectId.isValid(restaurant)) {
        return res.status(400).json({
          success: false,
          message: "Invalid restaurant ID",
        });
      }

      // Get menu item IDs from request
      const menuItemIds = items.map((item) => item.menuItem);

      // Fetch menu items from database
      const menuItems = await MenuItem.find({
        _id: { $in: menuItemIds },
        restaurant: restaurant,
      });

      // Check all requested items exist
      if (menuItems.length !== items.length) {
        return res.status(400).json({
          success: false,
          message: "One or more menu items are invalid",
        });
      }

      const orderItems = [];
      let subtotal = 0;

      for (const cartItem of items) {
        const menuItem = menuItems.find(
          (item) => item._id.toString() === cartItem.menuItem
        );

        if (!menuItem) {
          return res.status(400).json({
            success: false,
            message: "Menu item not found",
          });
        }

        if (!menuItem.isAvailable) {
          return res.status(400).json({
            success: false,
            message: `${menuItem.name} is currently unavailable`,
          });
        }

        const quantity = Number(cartItem.quantity);

        if (!quantity || quantity < 1) {
          return res.status(400).json({
            success: false,
            message: "Invalid item quantity",
          });
        }

        const itemTotal = menuItem.price * quantity;

        subtotal += itemTotal;

        orderItems.push({
          menuItem: menuItem._id,
          name: menuItem.name,
          price: menuItem.price,
          quantity,
        });
      }

      // Fixed delivery fee
      const deliveryFee = 40;

      // Final amount
      const totalAmount = subtotal + deliveryFee;

      // Create order
      const order = await Order.create({
        user: req.user._id,
        restaurant,
        items: orderItems,
        subtotal,
        deliveryFee,
        totalAmount,
      });

      res.status(201).json({
        success: true,
        message: "Order placed successfully",
        order,
      });
    } catch (error) {
      console.error("Create Order Error:", error.message);

      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);



// Get My Orders - Logged-in User Only
router.get(
  "/my-orders",
  authMiddleware,
  roleMiddleware("customer", "admin"),
  async (req, res) => {
    try {
      const orders = await Order.find({
        user: req.user._id,
      })
        .populate("restaurant", "name location")
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: orders.length,
        orders,
      });
    } catch (error) {
      console.error("Get My Orders Error:", error.message);

      res.status(500).json({
        success: false,
        message: "Server error while fetching orders",
      });
    }
  }
);



// Update Order Status - Admin Only
router.patch(
  "/:orderId/status",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      const allowedStatuses = [
        "Placed",
        "Confirmed",
        "Preparing",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ];

      // Validate order ID
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order ID",
        });
      }

      // Validate status
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order status",
        });
      }

      // Find order and update status
      const order = await Order.findByIdAndUpdate(
        orderId,
        { status },
        { new: true, runValidators: true }
      );

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Order status updated successfully",
        order,
      });
    } catch (error) {
      console.error("Update Order Status Error:", error.message);

      res.status(500).json({
        success: false,
        message: "Server error while updating order status",
      });
    }
  }
);




module.exports = router;