const express = require("express");
const router = express.Router();
const kategoriController = require("../controllers/kategoriController");
const { verifyToken } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");

router.post("/", verifyToken, isAdmin, kategoriController.createKategori);
router.get("/", verifyToken, kategoriController.getAllKategori);
router.get("/:id", verifyToken, kategoriController.getKategoriById);
router.put("/:id", verifyToken, isAdmin, kategoriController.updateKategori);
router.delete("/:id", verifyToken, isAdmin, kategoriController.deleteKategori);

module.exports = router;