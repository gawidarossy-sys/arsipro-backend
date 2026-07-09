const express = require("express");
const router = express.Router();

const suratKeluarController = require("../controllers/suratKeluarController");
const upload = require("../config/upload");
const { isAdmin } = require("../middleware/roleMiddleware");
const { verifyToken } = require("../middleware/authMiddleware");

// TEST
router.get("/test", (req, res) => {
  res.send("surat keluar jalan");
});

// TEST TOKEN
router.get("/cek-token", verifyToken, (req, res) => {
  res.json({
    message: "TOKEN VALID TEMBUS 🔥",
    user: req.user
  });
});

// GET TRASH
router.get("/trash", verifyToken, suratKeluarController.getTrashSuratKeluar);

// DOWNLOAD
router.get("/download/:id", verifyToken, suratKeluarController.downloadSuratKeluar);

// GET ALL
router.get("/", verifyToken, suratKeluarController.getAllSuratKeluar);

// TAMBAH
router.post(
  "/",
  (req, res, next) => {
    console.log("🔥 ROUTE SURAT KELUAR KE PANGGIL");
    next();
  },
  verifyToken,
  isAdmin,
  upload.single("file_surat"),
  suratKeluarController.createSuratKeluar
);

// RESTORE
router.put("/restore/:id", verifyToken, isAdmin, suratKeluarController.restoreSuratKeluar);

// HAPUS PERMANEN
router.delete("/trash/:id", verifyToken, isAdmin, suratKeluarController.forceDeleteSuratKeluar);

// SOFT DELETE
router.delete("/:id", verifyToken, isAdmin, suratKeluarController.deleteSuratKeluar);

module.exports = router;