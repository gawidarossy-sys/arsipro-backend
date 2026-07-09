const db = require("../config/database");
const path = require("path");

// CREATE SURAT KELUAR
exports.createSuratKeluar = (req, res) => {
    const { no_surat, nama_penerima, id_kategori } = req.body;

    const file_surat = req.file ? req.file.filename : null;

    if (!no_surat || !nama_penerima || !id_kategori || !file_surat) {
        return res.status(400).json({
            message: "data tidak lengkap"
        });
    }

    const sql = `
        INSERT INTO surat_keluar (no_surat, nama_penerima, id_kategori, file_surat)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [no_surat, nama_penerima, id_kategori, file_surat], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "gagal tambah surat keluar",
                error: err
            });
        }
        res.status(201).json({
            message: "berhasil tambah surat keluar"
        });
    });
};

// GET ALL (yang belum dihapus)
exports.getAllSuratKeluar = (req, res) => {
    const { search, id_kategori, page = 1, limit = 5 } = req.query;

    const offset = (page - 1) * limit;

    let sql = "SELECT * FROM surat_keluar WHERE deleted_at IS NULL";
    let countSql = "SELECT COUNT(*) as total FROM surat_keluar WHERE deleted_at IS NULL";
    let values = [];

    if (search) {
        sql += " AND (no_surat LIKE ? OR nama_penerima LIKE ?)";
        countSql += " AND (no_surat LIKE ? OR nama_penerima LIKE ?)";
        values.push(`%${search}%`, `%${search}%`);
    }

    if (id_kategori) {
        sql += " AND id_kategori = ?";
        countSql += " AND id_kategori = ?";
        values.push(id_kategori);
    }

    sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    values.push(parseInt(limit), parseInt(offset));

    db.query(sql, values, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal mengambil data",
                error: err
            });
        }

        db.query(countSql, values.slice(0, values.length - 2), (err2, countResult) => {
            if (err2) {
                return res.status(500).json({
                    message: "Gagal menghitung data",
                    error: err2
                });
            }

            res.json({
                data: result,
                total: countResult[0].total,
                page: parseInt(page),
                limit: parseInt(limit)
            });
        });
    });
};

// DOWNLOAD surat keluar
exports.downloadSuratKeluar = (req, res) => {
    const { id } = req.params;

    const sql = "SELECT file_surat FROM surat_keluar WHERE id_surat = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal mengambil data surat keluar",
                error: err
            });
        }

        if (result.length === 0 || !result[0].file_surat) {
            return res.status(404).json({
                message: "File surat keluar tidak ditemukan"
            });
        }

        const filePath = path.join(__dirname, "..", "uploads", result[0].file_surat);

        res.download(filePath, (err) => {
            if (err) {
                res.status(500).json({
                    message: "Gagal mendownload file",
                    error: err
                });
            }
        });
    });
};

// SOFT DELETE surat keluar
exports.deleteSuratKeluar = (req, res) => {
    const { id } = req.params;

    const sql = "UPDATE surat_keluar SET deleted_at = NOW() WHERE id_surat = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "gagal hapus data",
                error: err
            });
        }
        res.json({
            message: "Surat keluar dipindahkan ke trash"
        });
    });
};

// GET TRASH surat keluar
exports.getTrashSuratKeluar = (req, res) => {
    const sql = "SELECT * FROM surat_keluar WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC";

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal mengambil trash",
                error: err
            });
        }
        res.json(result);
    });
};

// RESTORE surat keluar
exports.restoreSuratKeluar = (req, res) => {
    const { id } = req.params;

    const sql = "UPDATE surat_keluar SET deleted_at = NULL WHERE id_surat = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal restore surat keluar",
                error: err
            });
        }
        res.json({
            message: "Surat keluar berhasil direstore"
        });
    });
};

// HAPUS PERMANEN surat keluar
exports.forceDeleteSuratKeluar = (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM surat_keluar WHERE id_surat = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal hapus permanen",
                error: err
            });
        }
        res.json({
            message: "Surat keluar berhasil dihapus permanen"
        });
    });
};