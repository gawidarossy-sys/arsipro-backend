const db = require("../config/database");

// =======================
// REGISTER USER
// =======================
exports.registerUser = (req, res) => {

    const { nama, email, password, role } = req.body;

    if (!nama || !email || !password || !role) {
        return res.status(400).json({
            message: "Data tidak lengkap"
        });
    }

    const sql = `
        INSERT INTO users (nama, email, password, role)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [nama, email, password, role], (err, result) => {

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
};

// =======================
// LOGIN
// =======================
exports.loginUser = (req, res) => {

    const { email, password } = req.body;

    const sql = `
        SELECT * FROM users
        WHERE email = ? AND password = ?
    `;

    db.query(sql, [email, password], (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        if (result.length === 0) {
            return res.status(401).json({
                message: "Email atau password salah"
            });
        }

        res.json({
            message: "Login berhasil",
            user: result[0]
        });

    });
};

// =======================
// GET ALL USER
// =======================
exports.getAllUsers = (req, res) => {

    const sql = `SELECT * FROM users`;

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(result);

    });
};