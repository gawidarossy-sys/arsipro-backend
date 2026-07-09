const db = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ================================
// REGISTER
// ================================
exports.register = (req, res) => {
    const { nama, username, email, password, role, jabatan, nomor_id } = req.body;

    // Validasi field wajib
    if (!nama || !username || !email || !password || !role || !nomor_id) {
        return res.status(400).json({
            message: "Data harus lengkap"
        });
    }

    // ✅ Validasi role & panjang digit nomor_id di SERVER (jangan percaya frontend begitu saja)
    const digits = String(nomor_id).replace(/\D/g, "");

    let detectedRole = null;
    if (digits.length === 10) {
        detectedRole = "mahasiswa";
    } else if (digits.length === 16) {
        detectedRole = "dosen";
    }

    if (!detectedRole) {
        return res.status(400).json({
            message: "Nomor harus 10 digit (NIM untuk Mahasiswa) atau 16 digit (NUPTK untuk Dosen)"
        });
    }

    if (detectedRole !== role) {
        return res.status(400).json({
            message: `Role tidak sesuai dengan nomor yang dimasukkan (terdeteksi: ${detectedRole})`
        });
    }

    // ✅ Cek username sudah dipakai belum
    const sqlCheckUsername = "SELECT * FROM users WHERE username = ?";
    db.query(sqlCheckUsername, [username], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (results.length > 0) {
            return res.status(400).json({ message: "Username sudah digunakan" });
        }

        // Cek email sudah dipakai belum
        const sqlCheckEmail = "SELECT * FROM users WHERE email = ?";
        db.query(sqlCheckEmail, [email], (err, results) => {
            if (err) return res.status(500).json({ message: "Database error" });
            if (results.length > 0) {
                return res.status(400).json({ message: "Email sudah terdaftar" });
            }

            // Cek nomor_id (NIM/NUPTK) sudah dipakai belum
            const sqlCheckNomorId = "SELECT * FROM users WHERE nomor_id = ?";
            db.query(sqlCheckNomorId, [digits], async (err, results) => {
                if (err) return res.status(500).json({ message: "Database error" });
                if (results.length > 0) {
                    return res.status(400).json({
                        message: detectedRole === "mahasiswa"
                            ? "NIM sudah terdaftar"
                            : "NUPTK sudah terdaftar"
                    });
                }

                try {
                    const hashedPassword = await bcrypt.hash(password, 10);

                    const sqlInsert = `
                        INSERT INTO users (nama, username, email, password, role, jabatan, nomor_id)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    `;

                    db.query(
                        sqlInsert,
                        [nama, username, email, hashedPassword, role, jabatan || null, digits],
                        (err) => {
                            if (err) {
                                return res.status(500).json({ message: "Gagal register", error: err });
                            }
                            res.status(201).json({ message: "Register berhasil" });
                        }
                    );
                } catch (error) {
                    return res.status(500).json({ message: "Error hashing password" });
                }
            });
        });
    });
};

// ================================
// LOGIN
// ================================
exports.login = (req, res) => {
    console.log("LOGIN HIT:", req.body);

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username dan password wajib" });
    }

    const sql = "SELECT * FROM users WHERE username = ?";

    db.query(sql, [username], async (err, results) => {
        if (err) {
            console.log("DB ERROR LOGIN DETAIL:", JSON.stringify(err));
            return res.status(500).json({ message: "Database error", error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        const user = results[0];

        try {
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(401).json({ message: "Password salah" });
            }

            const token = jwt.sign(
                { id: user.id_user, role: user.role },
                "secretkey123",
                { expiresIn: "1d" }
            );

            delete user.password;

            res.json({
                message: "Login berhasil",
                token,
                user
            });

        } catch (error) {
            return res.status(500).json({ message: "Error compare password" });
        }
    });
};