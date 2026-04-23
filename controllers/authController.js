const db = require("../config/database");

// REGISTER
exports.register = (req, res) => {

    const { nama, email, password, role, jabatan } = req.body;

    if (!nama || !email || !password || !role) {
        return res.status(400).json({
            message: "data harus lengkap"
        });
    }

    const sqlCheck = "SELECT * FROM users WHERE email = ?";

    db.query(sqlCheck, [email], (err, results) => {

        if (err) {
            console.log("DB ERROR:", err);
            return res.status(500).json({
                message: "database error"
            });
        }

        if (results.length > 0) {
            return res.status(400).json({
                message: "email sudah terdaftar"
            });
        }

        const sqlInsert = `
            INSERT INTO users (nama, email, password, role, jabatan)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(sqlInsert, [nama, email, password, role, jabatan], (err, result) => {

            if (err) {
                console.log("INSERT ERROR:", err);
                return res.status(500).json({
                    message: "gagal register"
                });
            }

            res.status(201).json({
                message: "register berhasil"
            });
        });

    });
};


// LOGIN
exports.login = (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "email dan password wajib"
        });
    }

    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "database error"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "user tidak ditemukan"
            });
        }

        const user = results[0];

        if (user.password !== password) {
            return res.status(401).json({
                message: "password salah"
            });
        }

        res.json({
            message: "login berhasil",
            user: user
        });

    });
};