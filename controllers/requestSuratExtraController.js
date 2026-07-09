// controllers/requestSuratExtraController.js
const db = require("../config/database");

// PATCH tandai request surat selesai (chat ditutup)
exports.markSelesai = (req, res) => {
    const { id } = req.params;

    const sql = `UPDATE request_surat SET status = 'selesai' WHERE id_request = ?`;

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Gagal menutup request", error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Request tidak ditemukan" });
        }
        res.json({ message: "Request ditandai selesai" });
    });
};