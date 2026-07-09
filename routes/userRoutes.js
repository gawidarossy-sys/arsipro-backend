const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const userController = require("../controllers/userController");
const { verifyToken } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");

// ── Konfigurasi upload foto profil ──
const storageFoto = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `foto_${req.params.id}_${Date.now()}${ext}`);
  }
});

const uploadFoto = multer({
  storage: storageFoto,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("File harus berupa gambar (JPG/PNG)."));
    }
    cb(null, true);
  }
});

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/", verifyToken, userController.getAllUsers);

// ✅ HARUS DI ATAS /:id agar tidak dianggap sebagai id
router.put("/profil/update", verifyToken, userController.updateProfilMahasiswa);

router.put("/:id", verifyToken, userController.updateUser);
router.put("/:id/foto", verifyToken, uploadFoto.single("foto"), userController.updateFotoUser);

router.delete("/:id", verifyToken, isAdmin, userController.deleteUser);

module.exports = router;