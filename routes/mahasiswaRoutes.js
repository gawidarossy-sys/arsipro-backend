const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken } = require("../middleware/authMiddleware");

// Update profil mahasiswa (nama, jabatan, foto)
router.put("/profil/update", verifyToken, userController.updateProfilMahasiswa);

module.exports = router;