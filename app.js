const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// ================= STATIC FILES =================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================= TEST DB =================
const db = require("./config/database");

app.get("/test-db", (req, res) => {
    db.query("SELECT 1", (err, result) => {
        if (err) {
            return res.json({ error: err.message });
        }
        res.json({ db: "OK", result });
    });
});

// ================= ROUTES =================

const userRoutes             = require("./routes/userRoutes");
const kategoriRoutes         = require("./routes/kategoriRoutes");
const suratMasukRoutes       = require("./routes/suratMasukRoutes");
const suratKeluarRoutes      = require("./routes/suratKeluarRoutes");
const requestSuratRoutes     = require("./routes/requestSuratRoutes");
const authRoutes             = require("./routes/authRoutes");
const arsipRoutes            = require("./routes/arsipRoutes");
const suratDosenRoutes       = require("./routes/suratDosenRoutes");
const mahasiswaRoutes        = require("./routes/mahasiswaRoutes");
const chatRequestRoutes      = require("./routes/chatRequestRoutes");       // ← BARU (chat request surat)
const requestSuratExtraRoutes = require("./routes/requestSuratExtraRoutes"); // ← BARU (tandai request selesai)

// ================= USE =================

app.use("/api/users",        userRoutes);
app.use("/api/kategori",     kategoriRoutes);
app.use("/api/surat-masuk",  suratMasukRoutes);
app.use("/api/surat-keluar", suratKeluarRoutes);
app.use("/api",              requestSuratRoutes);
app.use("/api/auth",         authRoutes);
app.use("/api/arsip",        arsipRoutes);
app.use("/api/surat-dosen",  suratDosenRoutes);
app.use("/api/mahasiswa",    mahasiswaRoutes);
app.use("/api",              chatRequestRoutes);        // ← BARU
app.use("/api",              requestSuratExtraRoutes);  // ← BARU

// =======================================

app.get("/", (req, res) => {
    res.send("API ARSIPRO berjalan...");
});

// Keep-alive agar koneksi DB tidak cold
setInterval(() => {
    db.query("SELECT 1", (err) => {
        if (err) console.log("Keep-alive error:", err.message);
    });
}, 4 * 60 * 1000);
app.listen(3000, "0.0.0.0", () => {
    console.log("Server berjalan di http://0.0.0.0:3000");
    console.log("Akses dari jaringan: http://10.183.105.115:3000");
    console.log("AUTH ROUTES AKTIF");
    console.log("CHAT REQUEST ROUTES AKTIF");
});