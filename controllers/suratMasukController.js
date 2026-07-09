const db = require("../config/database");
const path = require("path");
const fs = require("fs");

/**
 * ====================================================================
 * CATATAN PERBAIKAN
 * ====================================================================
 * 1) MASALAH "undefined" DI KOLOM KATEGORI:
 *    getAllSuratMasuk sebelumnya "SELECT * FROM surat_masuk" saja,
 *    tanpa JOIN ke tabel kategori. Sekarang di-JOIN ke tabel
 *    "kategori" (asumsi: primary key "id_kategori", kolom nama
 *    "nama_kategori" -- SESUAIKAN kalau beda).
 *
 * 2) MASALAH "null" DI KOLOM INSTANSI:
 *    Query INSERT sebelumnya TIDAK menyimpan field "instansi" sama
 *    sekali, padahal form-nya minta input instansi. Sekarang field
 *    instansi ikut disimpan.
 *    -> PENTING: pastikan tabel surat_masuk sudah punya kolom
 *       "instansi" (VARCHAR). Kalau belum ada, jalankan dulu:
 *       ALTER TABLE surat_masuk ADD COLUMN instansi VARCHAR(150) NULL;
 * ====================================================================
 */

// CREATE / TAMBAH SURAT MASUK
exports.tambahSuratMasuk = (req, res) => {
    const { no_surat, nama_pengirim, instansi, id_kategori, tanggal_surat, jenis_surat } = req.body;

    const file_surat = req.file ? req.file.filename : null;
    const nama_asli_file = req.file ? req.file.originalname : null;

    if (!no_surat || !nama_pengirim || !id_kategori || !file_surat) {
        return res.status(400).json({
            message: "data tidak lengkap"
        });
    }

    const sql = `
        INSERT INTO surat_masuk
            (no_surat, nama_pengirim, instansi, id_kategori, tanggal_surat, jenis_surat, file_surat, nama_asli_file)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [no_surat, nama_pengirim, instansi || null, id_kategori, tanggal_surat || null, jenis_surat || null, file_surat, nama_asli_file],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "gagal tambah surat masuk",
                    error: err
                });
            }
            res.status(201).json({
                message: "berhasil tambah surat masuk"
            });
        }
    );
};

// GET ALL SURAT MASUK (yang belum dihapus)
// >>> DIPERBAIKI: JOIN ke tabel kategori supaya nama_kategori ikut terambil
exports.getAllSuratMasuk = (req, res) => {
    const { search, id_kategori, jenis_surat, page = 1, limit = 5 } = req.query;

    const offset = (page - 1) * limit;

    let sql = `
        SELECT sm.*, k.nama_kategori
        FROM surat_masuk sm
        LEFT JOIN kategori_surat k ON sm.id_kategori = k.id_kategori
        WHERE sm.deleted_at IS NULL
    `;
    let countSql = `
        SELECT COUNT(*) as total
        FROM surat_masuk sm
        WHERE sm.deleted_at IS NULL
    `;
    let values = [];
    let countValues = [];

    if (search) {
        sql += " AND (sm.no_surat LIKE ? OR sm.nama_pengirim LIKE ?)";
        countSql += " AND (sm.no_surat LIKE ? OR sm.nama_pengirim LIKE ?)";
        values.push(`%${search}%`, `%${search}%`);
        countValues.push(`%${search}%`, `%${search}%`);
    }

    if (id_kategori) {
        sql += " AND sm.id_kategori = ?";
        countSql += " AND sm.id_kategori = ?";
        values.push(id_kategori);
        countValues.push(id_kategori);
    }

    if (jenis_surat) {
        sql += " AND sm.jenis_surat = ?";
        countSql += " AND sm.jenis_surat = ?";
        values.push(jenis_surat);
        countValues.push(jenis_surat);
    }

    sql += " ORDER BY sm.created_at DESC LIMIT ? OFFSET ?";
    values.push(parseInt(limit), parseInt(offset));

    db.query(sql, values, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal mengambil data",
                error: err
            });
        }

        db.query(countSql, countValues, (err2, countResult) => {
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

// DOWNLOAD surat masuk (nama file balik ke nama asli)
exports.downloadSuratMasuk = (req, res) => {
    const { id } = req.params;

    db.query("SELECT file_surat, nama_asli_file FROM surat_masuk WHERE id_surat = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Gagal mengambil data", error: err });
        if (!result.length) return res.status(404).json({ message: "Surat tidak ditemukan" });

        const surat = result[0];
        const filePath = path.join(__dirname, "..", "uploads", surat.file_surat);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: "File fisik tidak ditemukan di server" });
        }

        const namaDownload = surat.nama_asli_file || surat.file_surat;
        res.download(filePath, namaDownload);
    });
};

// SOFT DELETE surat masuk
exports.deleteSuratMasuk = (req, res) => {
    const { id } = req.params;

    const sql = "UPDATE surat_masuk SET deleted_at = NOW() WHERE id_surat = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "gagal hapus data",
                error: err
            });
        }
        res.json({
            message: "Surat masuk dipindahkan ke trash"
        });
    });
};

// GET TRASH surat masuk
// >>> DIPERBAIKI: JOIN kategori juga disamakan di sini biar konsisten
exports.getTrashSuratMasuk = (req, res) => {
    const sql = `
        SELECT sm.*, k.nama_kategori
        FROM surat_masuk sm
        LEFT JOIN kategori_surat k ON sm.id_kategori = k.id_kategori
        WHERE sm.deleted_at IS NOT NULL
        ORDER BY sm.deleted_at DESC
    `;

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

// RESTORE surat masuk
exports.restoreSuratMasuk = (req, res) => {
    const { id } = req.params;

    const sql = "UPDATE surat_masuk SET deleted_at = NULL WHERE id_surat = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal restore surat masuk",
                error: err
            });
        }
        res.json({
            message: "Surat masuk berhasil direstore"
        });
    });
};

// HAPUS PERMANEN surat masuk
exports.forceDeleteSuratMasuk = (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM surat_masuk WHERE id_surat = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal hapus permanen",
                error: err
            });
        }
        res.json({
            message: "Surat masuk berhasil dihapus permanen"
        });
    });
};