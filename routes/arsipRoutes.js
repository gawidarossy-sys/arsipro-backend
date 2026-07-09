const express = require("express");
const router = express.Router();
const arsipController = require("../controllers/arsipController");
const upload = require("../config/upload");
const { verifyToken } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");

// GET TRASH
router.get("/trash", verifyToken, arsipController.getTrashArsip);

// GET ALL
router.get("/", verifyToken, arsipController.getAllArsip);

// TAMBAH (dosen dan admin bisa)
router.post("/", verifyToken, upload.single("file_arsip"), arsipController.createArsip);

// RESTORE (admin only)
router.put("/restore/:id", verifyToken, isAdmin, arsipController.restoreArsip);

// HAPUS PERMANEN (admin only)
router.delete("/trash/:id", verifyToken, isAdmin, arsipController.forceDeleteArsip);

// SOFT DELETE (dosen dan admin bisa)
router.delete("/:id", verifyToken, arsipController.deleteArsip);

module.exports = router;