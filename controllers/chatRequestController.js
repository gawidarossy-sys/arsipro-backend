// controllers/chatRequestController.js
const db = require("../config/database");

// GET semua pesan chat untuk 1 request
exports.getChat = (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT 
            c.*,
            u.nama AS nama_pengirim
        FROM chat_request c
        LEFT JOIN users u ON c.id_user = u.id_user
        WHERE c.id_request = ?
        ORDER BY c.created_at ASC
    `;

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Gagal mengambil chat", error: err });
        }
        res.json(result);
    });
};

// POST kirim pesan chat
exports.sendChat = (req, res) => {
    const { id } = req.params;
    const { pengirim, isi } = req.body;

    if (!isi || !pengirim) {
        return res.status(400).json({ message: "Pengirim dan isi pesan wajib diisi" });
    }

    // id_user dari token jika ada, atau null untuk admin sistem
    const id_user = req.user ? req.user.id_user : null;

    const sql = `
        INSERT INTO chat_request (id_request, id_user, pengirim, isi)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [id, id_user, pengirim, isi], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Gagal kirim pesan", error: err });
        }
        res.json({ message: "Pesan berhasil dikirim", id_chat: result.insertId });
    });
};