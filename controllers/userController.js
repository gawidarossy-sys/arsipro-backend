const db = require("../config/database");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// =======================
// REGISTER USER
// =======================
exports.registerUser = async (req, res) => {
    const { nama, email, password, role } = req.body;
    if (!nama || !email || !password || !role) {
        return res.status(400).json({
            message: "Data tidak lengkap"
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO users (nama, email, password, role)
            VALUES (?, ?, ?, ?)
        `;
        db.query(sql, [nama, email, hashedPassword, role], (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Gagal register",
                    error: err
                });
            }
            res.json({
                message: "User berhasil dibuat"
            });
        });
    } catch (err) {
        res.status(500).json({
            message: "Gagal memproses password",
            error: err
        });
    }
};

// =======================
// LOGIN
// =======================
exports.loginUser = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email dan password wajib diisi"
        });
    }

    const sql = `SELECT * FROM users WHERE email = ?`;

    db.query(sql, [email], async (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        if (result.length === 0) {
            return res.status(401).json({
                message: "Email atau password salah"
            });
        }

        const user = result[0];

        let match = false;
        try {
            match = await bcrypt.compare(password, user.password);
        } catch (err) {
            match = false;
        }

        if (!match) {
            return res.status(401).json({
                message: "Email atau password salah"
            });
        }

        delete user.password;

        res.json({
            message: "Login berhasil",
            user
        });
    });
};

// =======================
// GET ALL USER
// =======================
exports.getAllUsers = (req, res) => {
    const sql = `SELECT id_user, nama, email, role, jabatan, created_at FROM users`;
    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.json(result);
    });
};

// =======================
// DELETE USER
// =======================
exports.deleteUser = (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM users WHERE id_user = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal hapus user",
                error: err
            });
        }
        res.json({
            message: "User berhasil dihapus"
        });
    });
};

// =======================
// UPDATE USER (ADMIN)
// =======================
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { nama, email, jabatan, password } = req.body;

    if (!nama || !email) {
        return res.status(400).json({
            message: "Nama dan email wajib diisi"
        });
    }

    try {
        let sql, params;

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            sql = `UPDATE users SET nama = ?, email = ?, jabatan = ?, password = ? WHERE id_user = ?`;
            params = [nama, email, jabatan, hashedPassword, id];
        } else {
            sql = `UPDATE users SET nama = ?, email = ?, jabatan = ? WHERE id_user = ?`;
            params = [nama, email, jabatan, id];
        }

        db.query(sql, params, (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Gagal memperbarui profil",
                    error: err
                });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "User tidak ditemukan (id_user tidak cocok)"
                });
            }
            res.json({
                message: "Profil berhasil diperbarui"
            });
        });
    } catch (err) {
        res.status(500).json({
            message: "Gagal memproses password",
            error: err
        });
    }
};

// =======================
// UPDATE FOTO PROFIL
// =======================
exports.updateFotoUser = (req, res) => {
    const { id } = req.params;

    if (!req.file) {
        return res.status(400).json({
            message: "File foto tidak ditemukan"
        });
    }

    const sql = `UPDATE users SET foto = ? WHERE id_user = ?`;
    db.query(sql, [req.file.filename, id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal menyimpan foto",
                error: err
            });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "User tidak ditemukan (id_user tidak cocok)"
            });
        }
        res.json({
            message: "Foto berhasil diperbarui",
            foto: req.file.filename
        });
    });
};

// =======================
// UPDATE PROFIL MAHASISWA
// (PUT /api/mahasiswa/profil/update)
// =======================
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storageProfil = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        // ✅ FIXED: pakai req.user.id bukan req.user.id_user
        cb(null, `foto_${req.user.id}_${Date.now()}${ext}`);
    },
});

const uploadProfil = multer({
    storage: storageProfil,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp"];
        allowed.includes(file.mimetype)
            ? cb(null, true)
            : cb(new Error("Format file tidak didukung. Gunakan JPG/PNG."));
    },
});

exports.updateProfilMahasiswa = [
    uploadProfil.single("foto"),
    (req, res) => {
        const { nama, jabatan } = req.body;
        // ✅ FIXED: pakai req.user.id bukan req.user.id_user
        const userId = req.user.id;

        console.log("USER ID:", userId);
        console.log("BODY:", req.body);

        if (!nama || !jabatan) {
            return res.status(400).json({ message: "Nama dan program studi wajib diisi." });
        }

        if (!userId) {
            return res.status(401).json({ message: "User tidak terautentikasi." });
        }

        // Ambil foto lama untuk dihapus jika ada foto baru
        db.query("SELECT foto FROM users WHERE id_user = ?", [userId], (err, rows) => {
            if (err || rows.length === 0) {
                return res.status(404).json({ message: "User tidak ditemukan." });
            }

            const fotoLama = rows[0].foto;

            // Hapus foto lama jika ada foto baru
            if (req.file && fotoLama) {
                const oldPath = path.join(uploadDir, fotoLama);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }

            const fotoFileName = req.file ? req.file.filename : fotoLama;

            const sqlUpdate = `UPDATE users SET nama = ?, jabatan = ?, foto = ? WHERE id_user = ?`;
            db.query(sqlUpdate, [nama.trim(), jabatan.trim(), fotoFileName, userId], (err2) => {
                if (err2) {
                    return res.status(500).json({ message: "Gagal menyimpan perubahan." });
                }

                // Kembalikan data terbaru ke frontend
                db.query(
                    "SELECT id_user, nama, email, jabatan, role, foto, nomor_id FROM users WHERE id_user = ?",
                    [userId],
                    (err3, result) => {
                        if (err3) return res.status(500).json({ message: "Gagal mengambil data." });

                        const user = result[0];
                        return res.status(200).json({
                            message: "Profil berhasil diperbarui.",
                            user: {
                                id:       user.id_user,
                                nama:     user.nama,
                                email:    user.email,
                                jabatan:  user.jabatan,
                                role:     user.role,
                                foto:     user.foto || null,
                                nomor_id: user.nomor_id || null,
                            },
                        });
                    }
                );
            });
        });
    },
];