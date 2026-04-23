const express = require("express");
const router = express.Router();

const suratKeluarController = require("../controllers/suratKeluarController");
const upload = require("../config/upload");
const { isAdmin } = require("../middleware/roleMiddleware");

// 🔍 TARUH DI SINI (SETELAH REQUIRE)
console.log("createSuratKeluar:", typeof suratKeluarController.createSuratKeluar);
console.log("isAdmin:", typeof isAdmin);

// TEST
router.get("/test", (req, res) => {
  res.send("surat keluar jalan");
});

// TAMBAH
router.post(
  "/",
  upload.single("file_surat"),
  isAdmin,
  suratKeluarController.createSuratKeluar
);

// GET
router.get("/", suratKeluarController.getAllSuratKeluar);

// DELETE
router.delete("/:id", isAdmin, suratKeluarController.deleteSuratKeluar);

module.exports = router;