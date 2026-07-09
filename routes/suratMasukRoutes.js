const express = require("express");
const router = express.Router();

const {
  getAllSuratMasuk,
  tambahSuratMasuk,
  deleteSuratMasuk,
  getTrashSuratMasuk,
  restoreSuratMasuk,
  forceDeleteSuratMasuk,
  downloadSuratMasuk
} = require("../controllers/suratMasukController");

const upload = require("../config/upload");
const { verifyToken } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");

router.get("/trash", verifyToken, getTrashSuratMasuk);
router.get("/download/:id", verifyToken, downloadSuratMasuk);
router.get("/", verifyToken, getAllSuratMasuk);
router.post("/", verifyToken, upload.single("file_surat"), tambahSuratMasuk);
router.put("/restore/:id", verifyToken, isAdmin, restoreSuratMasuk);
router.delete("/trash/:id", verifyToken, isAdmin, forceDeleteSuratMasuk);
router.delete("/:id", verifyToken, isAdmin, deleteSuratMasuk);

module.exports = router;