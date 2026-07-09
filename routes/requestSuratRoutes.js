const express = require("express");
const router = express.Router();

const requestSuratController = require("../controllers/requestSuratController");
const chatController = require("../controllers/chatRequestController");
const upload = require("../config/upload");
const { isAdmin } = require("../middleware/roleMiddleware");
const { verifyToken } = require("../middleware/authMiddleware");

// TEST
router.get("/test", (req, res) => {
    res.send("request surat jalan");
});

// upload SEBELUM verifyToken agar req.body bisa dibaca
router.post("/request-surat", upload.single("file_contoh"), verifyToken, requestSuratController.createRequestSurat);

// LIHAT REQUEST SENDIRI
router.get("/request-surat/:id", verifyToken, requestSuratController.getMyRequest);

// ADMIN LIHAT SEMUA REQUEST
router.get("/request-surat", verifyToken, isAdmin, requestSuratController.getAllRequest);

// ADMIN UPDATE STATUS
router.put("/request-surat/:id", verifyToken, isAdmin, requestSuratController.updateStatus);

// ADMIN UPLOAD BALASAN
router.post("/request-surat/:id/balasan", upload.single("file_balasan"), verifyToken, isAdmin, requestSuratController.uploadBalasan);

// ADMIN UPLOAD FILE PERBAIKAN
router.post("/upload-perbaikan", upload.single("file"), verifyToken, isAdmin, requestSuratController.uploadPerbaikan);

// ADMIN KIRIM BALIK KE DOSEN
router.post("/request-surat/:id/kirim-balik", verifyToken, isAdmin, requestSuratController.kirimBalik);

// CHAT - GET pesan
router.get("/chat-request/:id", verifyToken, chatController.getChat);

// CHAT - POST kirim pesan
router.post("/chat-request/:id", verifyToken, chatController.sendChat);

// DOWNLOAD FILE — TANPA verifyToken karena dipanggil dari <a href> / window.open
// yang tidak bisa kirim header Authorization
router.get("/download/:id/:type", requestSuratController.downloadFile);

module.exports = router;