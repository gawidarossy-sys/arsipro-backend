// controllers/requestSuratController.js
const db = require("../config/database");
const path = require("path");

/**
 * ====================================================================
 * CATATAN PERBAIKAN (baca ini dulu sebelum pakai file ini)
 * ====================================================================
 * Masalah sebelumnya: query getAllRequest & getMyRequest hanya
 * "SELECT * FROM request_surat" tanpa JOIN ke tabel user, padahal
 * kolom "nama" tidak ada di tabel request_surat. Akibatnya frontend
 * tidak pernah menerima field "nama" -> tampil kosong / karakter aneh.
 *
 * Saya asumsikan struktur berikut (SESUAIKAN kalau berbeda):
 *   - Ada 1 tabel "users" untuk semua pengguna (dosen & mahasiswa)
 *   - Primary key tabel users = "id_user"
 *   - Kolom nama di tabel users = "nama"
 *
 * KALAU nama dosen & mahasiswa disimpan di 2 TABEL BERBEDA
 * (misalnya tabel "dosen" dan tabel "mahasiswa", bukan satu tabel
 * "users"), maka ganti bagian JOIN di getAllRequest & getMyRequest
 * dengan versi LEFT JOIN ganda seperti contoh di bagian paling
 * bawah file ini (ada di komentar ALTERNATIF).
 * ====================================================================
 */

// USER: BUAT REQUEST SURAT BARU
exports.createRequestSurat = (req, res) => {
    const { id_user, judul_surat, deskripsi, tanggal_request, role_pengirim } = req.body;
    const file_contoh      = req.file ? req.file.filename : null;      // nama internal (angka)
    const nama_asli_contoh = req.file ? req.file.originalname : null;  // nama asli file

    if (!id_user || !judul_surat || !deskripsi || !tanggal_request) {
        return res.status(400).json({
            message: "Judul, deskripsi, id_user, dan tanggal wajib diisi"
        });
    }

    const sql = `
        INSERT INTO request_surat
            (id_user, judul_surat, deskripsi, tanggal_request, role_pengirim, file_contoh, nama_asli_contoh, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `;

    db.query(
        sql,
        [id_user, judul_surat, deskripsi, tanggal_request, role_pengirim || "mahasiswa", file_contoh, nama_asli_contoh],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Gagal membuat request surat",
                    error: err
                });
            }
            res.status(201).json({
                message: "Request surat berhasil dibuat",
                id_request: result.insertId
            });
        }
    );
};

// USER: LIHAT SEMUA RIWAYAT REQUEST MILIK SENDIRI (BY id_user)
// >>> DIPERBAIKI: sekarang JOIN ke tabel users supaya "nama" ikut terambil
exports.getMyRequest = (req, res) => {
    const { id } = req.params; // di sini "id" adalah id_user

    const sql = `
        SELECT rs.*, u.nama AS nama
        FROM request_surat rs
        LEFT JOIN users u ON rs.id_user = u.id_user
        WHERE rs.id_user = ?
        ORDER BY rs.created_at DESC
    `;

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal mengambil data request",
                error: err
            });
        }

        res.json(result); // selalu array, walau kosong []
    });
};

// ADMIN: LIHAT SEMUA REQUEST
// >>> DIPERBAIKI: sekarang JOIN ke tabel users supaya "nama" ikut terambil
exports.getAllRequest = (req, res) => {
    const sql = `
        SELECT rs.*, u.nama AS nama
        FROM request_surat rs
        LEFT JOIN users u ON rs.id_user = u.id_user
        ORDER BY rs.created_at DESC
    `;

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal mengambil semua request",
                error: err
            });
        }
        res.json(result);
    });
};

// ADMIN: UPDATE STATUS REQUEST
exports.updateStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({
            message: "Status wajib diisi"
        });
    }

    const sql = "UPDATE request_surat SET status = ? WHERE id_request = ?";

    db.query(sql, [status, id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal update status",
                error: err
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Request tidak ditemukan"
            });
        }

        res.json({
            message: "Status berhasil diupdate"
        });
    });
};

// ADMIN: UPLOAD FILE BALASAN
exports.uploadBalasan = (req, res) => {
    const { id } = req.params;
    const file_balasan      = req.file ? req.file.filename : null;
    const nama_asli_balasan = req.file ? req.file.originalname : null;

    if (!file_balasan) {
        return res.status(400).json({
            message: "File balasan wajib diupload"
        });
    }

    const sql = "UPDATE request_surat SET file_balasan = ?, nama_asli_balasan = ?, status = 'diproses' WHERE id_request = ?";

    db.query(sql, [file_balasan, nama_asli_balasan, id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal upload file balasan",
                error: err
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Request tidak ditemukan"
            });
        }

        res.json({
            message: "File balasan berhasil diupload"
        });
    });
};

// ADMIN: UPLOAD FILE PERBAIKAN
exports.uploadPerbaikan = (req, res) => {
    const { id_request } = req.body;
    const file_perbaikan      = req.file ? req.file.filename : null;
    const nama_asli_perbaikan = req.file ? req.file.originalname : null;

    if (!id_request || !file_perbaikan) {
        return res.status(400).json({
            message: "id_request dan file wajib diisi"
        });
    }

    const sql = "UPDATE request_surat SET file_perbaikan = ?, nama_asli_perbaikan = ? WHERE id_request = ?";

    db.query(sql, [file_perbaikan, nama_asli_perbaikan, id_request], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal upload file perbaikan",
                error: err
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Request tidak ditemukan"
            });
        }

        res.json({
            message: "File perbaikan berhasil diupload"
        });
    });
};

// ADMIN: KIRIM BALIK KE DOSEN
exports.kirimBalik = (req, res) => {
    const { id } = req.params;

    const sql = "UPDATE request_surat SET status = 'dikirim_balik' WHERE id_request = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal mengirim balik request",
                error: err
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Request tidak ditemukan"
            });
        }

        res.json({
            message: "Request berhasil dikirim balik ke dosen"
        });
    });
};

// DOWNLOAD FILE (contoh / balasan / perbaikan) — dengan NAMA ASLI
exports.downloadFile = (req, res) => {
    const { id, type } = req.params;

    // tiap type punya kolom nama internal + kolom nama asli
    const kolomValid = {
        contoh:    { file: "file_contoh",    asli: "nama_asli_contoh" },
        balasan:   { file: "file_balasan",   asli: "nama_asli_balasan" },
        perbaikan: { file: "file_perbaikan", asli: "nama_asli_perbaikan" }
    };

    const kolom = kolomValid[type];

    if (!kolom) {
        return res.status(400).json({
            message: "Tipe file tidak valid. Gunakan: contoh, balasan, atau perbaikan"
        });
    }

    const sql = `SELECT ${kolom.file}, ${kolom.asli} FROM request_surat WHERE id_request = ?`;

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal mengambil data file",
                error: err
            });
        }

        if (result.length === 0 || !result[0][kolom.file]) {
            return res.status(404).json({
                message: "File tidak ditemukan"
            });
        }

        const namaInternal = result[0][kolom.file];                  // 1783173551410.docx
        const namaAsli     = result[0][kolom.asli] || namaInternal;  // fallback ke nama internal kalau NULL (file lama)

        const filePath = path.join(__dirname, "..", "uploads", namaInternal);

        // argumen kedua = nama file saat di-download → INI yang bikin nama asli muncul
        res.download(filePath, namaAsli, (err) => {
            if (err && !res.headersSent) {
                res.status(500).json({
                    message: "Gagal mendownload file",
                    error: err
                });
            }
        });
    });
};

/**
 * ====================================================================
 * ALTERNATIF: kalau nama dosen & mahasiswa disimpan di 2 TABEL BEDA
 * (misal tabel "dosen" dan tabel "mahasiswa"), ganti query di
 * getAllRequest & getMyRequest dengan versi ini (sesuaikan nama
 * kolom id & nama di masing-masing tabel):
 * ====================================================================
 *
 * const sql = `
 *     SELECT
 *         rs.*,
 *         CASE
 *             WHEN rs.role_pengirim = 'dosen' THEN d.nama
 *             WHEN rs.role_pengirim = 'mahasiswa' THEN m.nama
 *         END AS nama
 *     FROM request_surat rs
 *     LEFT JOIN dosen d ON rs.role_pengirim = 'dosen' AND rs.id_user = d.id_dosen
 *     LEFT JOIN mahasiswa m ON rs.role_pengirim = 'mahasiswa' AND rs.id_user = m.id_mahasiswa
 *     ORDER BY rs.created_at DESC
 * `;
 */