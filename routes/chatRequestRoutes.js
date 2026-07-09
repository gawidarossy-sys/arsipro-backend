const express = require("express");
const router = express.Router();
const chatRequestController = require("../controllers/chatRequestController");

// GANTI "authMiddleware" di bawah ini kalau nama file middleware kamu beda
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/chat/:id", verifyToken, chatRequestController.getChat);
router.post("/chat/:id", verifyToken, chatRequestController.sendChat);

module.exports = router;