const express = require("express");
const router = express.Router();

const suratKeluarController = require("../controllers/suratKeluarController");
const upload = require("../config/upload");
const { isAdmin } = require("../middleware/roleMiddleware");

// TEST
router.get("/test", (req, res) => {
    res.send("surat keluar jalan");
});

// ➕ TAMBAH SURAT KELUAR
router.post(
  "/",
  upload.single("file_surat"),
  isAdmin,
  suratKeluarController.createSuratKeluar
);

// 📄 GET SEMUA
router.get("/", suratKeluarController.getAllSuratKeluar);

// ❌ DELETE
router.delete("/:id", isAdmin, suratKeluarController.deleteSuratKeluar);

module.exports = router;