const jwt = require("jsonwebtoken");

// ✅ TAMBAH: verifyToken — decode token dan simpan ke req.user
const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ message: "Token tidak ditemukan" });
    }

    try {
        const decoded = jwt.verify(token, "secretkey123");
        req.user = decoded; // { id, role }
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token tidak valid atau sudah expired" });
    }
};

const isAdmin = (req, res, next) => {
    console.log("USER DARI TOKEN:", req.user);

    if (!req.user) {
        return res.status(401).json({ message: "user tidak terautentikasi" });
    }
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "akses hanya untuk admin" });
    }
    next();
};

const isDosen = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "user tidak terautentikasi" });
    }
    if (req.user.role !== "dosen") {
        return res.status(403).json({ message: "akses hanya untuk dosen" });
    }
    next();
};

module.exports = {
    verifyToken,
    isAdmin,
    isDosen
};