const express = require("express");
const MenuItem = require("../models/MenuItem");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();


// GET all menu items of a restaurant
router.get("/restaurant/:restaurantId", async (req, res) => {
  try {
    const menuItems = await MenuItem.find({
      restaurant: req.params.restaurantId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: menuItems.length,
      menuItems,
    });
  } catch (error) {
    console.error("Get Menu Items Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


// GET single menu item by ID
router.get("/:id", async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate(
      "restaurant",
      "name location"
    );

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    res.status(200).json({
      success: true,
      menuItem,
    });
  } catch (error) {
    console.error("Get Menu Item Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


// Create Menu Item - Admin Only
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const {
        restaurant,
        name,
        description,
        price,
        image,
        category,
        isAvailable,
      } = req.body;

      if (!restaurant || !name || !description || !price || !category) {
        return res.status(400).json({
          success: false,
          message:
            "Restaurant, name, description, price and category are required",
        });
      }

      const menuItem = await MenuItem.create({
        restaurant,
        name,
        description,
        price,
        image: image || "",
        category,
        isAvailable:
          isAvailable !== undefined ? isAvailable : true,
      });

      res.status(201).json({
        success: true,
        message: "Menu item created successfully",
        menuItem,
      });
    } catch (error) {
      console.error("Create Menu Item Error:", error.message);

      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);


// Delete Menu Item - Admin Only
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const menuItem = await MenuItem.findById(req.params.id);

      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: "Menu item not found",
        });
      }

      await MenuItem.findByIdAndDelete(req.params.id);

      res.status(200).json({
        success: true,
        message: "Menu item deleted successfully",
      });
    } catch (error) {
      console.error("Delete Menu Item Error:", error.message);

      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);


module.exports = router;