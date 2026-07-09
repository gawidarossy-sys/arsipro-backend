const express = require("express");
const router = express.Router();
const suratDosenController = require("../controllers/suratDosenController");
const upload = require("../config/upload");
const { verifyToken } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");

// Admin kirim surat ke dosen
router.post("/", verifyToken, isAdmin, upload.single("file_surat"), suratDosenController.kirimSurat);

// Admin lihat semua surat yang dikirim
router.get("/", verifyToken, isAdmin, suratDosenController.getAllSuratDikirim);

// Dosen lihat surat masuk
router.get("/masuk", verifyToken, suratDosenController.getSuratMasukDosen);

// Hapus surat
router.delete("/:id", verifyToken, isAdmin, suratDosenController.deleteSurat);

module.exports = router;