const express = require("express");
const router = express.Router();
const requestSuratExtraController = require("../controllers/requestSuratExtraController");

// GANTI "authMiddleware" di bawah ini kalau nama file middleware kamu beda
const { verifyToken } = require("../middleware/authMiddleware");

router.put("/request-surat/:id/selesai", verifyToken, requestSuratExtraController.markSelesai);

module.exports = router;