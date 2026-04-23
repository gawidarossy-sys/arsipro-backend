const express = require("express");
const router = express.Router();

const {
  getAllSuratMasuk,
  tambahSuratMasuk
} = require("../controllers/suratMasukController");

const upload = require("../config/upload");

router.get("/", getAllSuratMasuk);

router.post("/", upload.single("file_surat"), tambahSuratMasuk);

module.exports = router;