const express = require("express");
const Restaurant = require("../models/Restaurant");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();



// GET all restaurants
router.get("/", async (req, res) => {
  try {
    const restaurants = await Restaurant.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: restaurants.length,
      restaurants,
    });
  } catch (error) {
    console.error("Get Restaurants Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// GET single restaurant by ID
router.get("/:id", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    res.status(200).json({
      success: true,
      restaurant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant",
      error: error.message,
    });
  }
});

// Create Restaurant - Admin Only
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const {
        name,
        description,
        image,
        cuisine,
        location,
        rating,
      } = req.body;

      if (!name || !description || !image || !cuisine || !location) {
        return res.status(400).json({
          success: false,
          message:
            "Name, description, image, cuisine and location are required",
        });
      }

      const restaurant = await Restaurant.create({
        name,
        description,
        image,
        cuisine,
        location,
        rating: rating || 0,
        createdBy: req.user._id,
      });

      res.status(201).json({
        success: true,
        message: "Restaurant created successfully",
        restaurant,
      });
    } catch (error) {
      console.error("Create Restaurant Error:", error.message);

      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Delete Restaurant - Admin Only
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const restaurant = await Restaurant.findById(req.params.id);

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: "Restaurant not found",
        });
      }

      await Restaurant.findByIdAndDelete(req.params.id);

      res.status(200).json({
        success: true,
        message: "Restaurant deleted successfully",
      });
    } catch (error) {
      console.error("Delete Restaurant Error:", error.message);

      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

module.exports = router;