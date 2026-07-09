const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

// 🔥 DEBUG (boleh tetap ada)
console.log("🔥 authRoutes ke-load");

// TEST
router.get("/test", (req, res) => {
    res.send("AUTH JALAN");
});

// REGISTER
router.post("/register", authController.register);

// LOGIN
router.post("/login", authController.login);

module.exports = router;