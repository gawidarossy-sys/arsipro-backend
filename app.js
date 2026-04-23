const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ================= ROUTES =================

const userRoutes = require("./routes/userRoutes");
const kategoriRoutes = require("./routes/kategoriRoutes");
const suratMasukRoutes = require("./routes/suratMasukRoutes");
const suratKeluarRoutes = require("./routes/suratKeluarRoutes");
const requestSuratRoutes = require("./routes/requestSuratRoutes");

// ================= USE =================

app.use("/api/users", userRoutes);
app.use("/api/kategori", kategoriRoutes);
app.use("/api/surat-masuk", suratMasukRoutes);
app.use("/api/surat-keluar", suratKeluarRoutes);
app.use("/api", requestSuratRoutes);

// =======================================

app.get("/", (req, res) => {
    res.send("API ARSIPRO berjalan...");
});

app.listen(3000, () => {
    console.log("Server berjalan di http://localhost:3000");
});