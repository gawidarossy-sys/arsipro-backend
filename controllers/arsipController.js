const db = require("../config/database");

// GET arsip milik user sendiri
exports.getAllArsip = (req, res) => {
    const { tahun, kategori } = req.query;
    const id_user = req.user.id;

    let sql = "SELECT * FROM arsip WHERE deleted_at IS NULL AND id_user = ?";
    let values = [id_user];

    if (tahun) {
        sql += " AND tahun = ?";
        values.push(tahun);
    }

    if (kategori) {
        sql += " AND kategori = ?";
        values.push(kategori);
    }

    sql += " ORDER BY tanggal DESC";

    db.query(sql, values, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal mengambil data arsip",
                error: err
            });
        }
        res.json(result);
    });
};

// TAMBAH arsip
exports.createArsip = (req, res) => {
    const { nama_surat, kategori, tanggal } = req.body;
    const file_arsip = req.file ? req.file.filename : null;
    const tahun = new Date(tanggal).getFullYear();
    const id_user = req.user.id;

    if (!nama_surat || !tanggal || !file_arsip) {
        return res.status(400).json({
            message: "Data tidak lengkap"
        });
    }

    const sql = `
        INSERT INTO arsip (nama_surat, kategori, tanggal, tahun, file_arsip, id_user)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [nama_surat, kategori, tanggal, tahun, file_arsip, id_user], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal simpan arsip",
                error: err
            });
        }
        res.status(201).json({
            message: "Arsip berhasil disimpan"
        });
    });
};

// SOFT DELETE arsip
exports.deleteArsip = (req, res) => {
    const { id } = req.params;

    const sql = "UPDATE arsip SET deleted_at = NOW() WHERE id_arsip = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal hapus arsip",
                error: err
            });
        }
        res.json({ message: "Arsip dipindahkan ke trash" });
    });
};

// GET TRASH arsip
exports.getTrashArsip = (req, res) => {
    const id_user = req.user.id;
    const sql = "SELECT * FROM arsip WHERE deleted_at IS NOT NULL AND id_user = ? ORDER BY deleted_at DESC";

    db.query(sql, [id_user], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal mengambil trash arsip",
                error: err
            });
        }
        res.json(result);
    });
};

// RESTORE arsip
exports.restoreArsip = (req, res) => {
    const { id } = req.params;

    const sql = "UPDATE arsip SET deleted_at = NULL WHERE id_arsip = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal restore arsip",
                error: err
            });
        }
        res.json({ message: "Arsip berhasil direstore" });
    });
};

// HAPUS PERMANEN arsip
exports.forceDeleteArsip = (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM arsip WHERE id_arsip = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal hapus permanen arsip",
                error: err
            });
        }
        res.json({ message: "Arsip berhasil dihapus permanen" });
    });
};