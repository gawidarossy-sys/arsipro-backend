const db = require("../config/database");
const path = require("path"); // ⬅️ TAMBAHAN

// tambah request surat (dosen)
exports.createRequestSurat = (req, res) => {
    const { id_user, judul_surat, deskripsi, tanggal_request } = req.body;

    const sql = `
        INSERT INTO request_surat 
        (id_user, judul_surat, deskripsi, tanggal_request)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [id_user, judul_surat, deskripsi, tanggal_request], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal membuat request surat",
                error: err
            });
        }

        res.json({
            message: "Request surat berhasil dikirim",
            data: result
        });
    });
};


// lihat request dosen sendiri
exports.getMyRequest = (req, res) => {
    const id_user = req.params.id;

    const sql = `
        SELECT * FROM request_surat
        WHERE id_user = ?
        ORDER BY created_at DESC
    `;

    db.query(sql, [id_user], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal mengambil data",
                error: err
            });
        }

        res.json(result);
    });
};


// admin lihat semua request
exports.getAllRequest = (req, res) => {

    const sql = `
        SELECT request_surat.*, users.nama
        FROM request_surat
        JOIN users ON request_surat.id_user = users.id
        ORDER BY created_at DESC
    `;

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal mengambil data",
                error: err
            });
        }

        res.json(result);
    });
};


// admin approve atau tolak
exports.updateStatus = (req, res) => {

    const id = req.params.id;
    const { status } = req.body;

    const sql = `
        UPDATE request_surat
        SET status = ?
        WHERE id_request = ?
    `;

    db.query(sql, [status, id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal update status",
                error: err
            });
        }

        res.json({
            message: "Status berhasil diupdate"
        });
    });
};


// ✅ UPLOAD FILE BALASAN (ADMIN)
exports.uploadBalasan = (req, res) => {
    const { id } = req.params;

    const file_balasan = req.file ? req.file.filename : null;

    if (!file_balasan) {
        return res.status(400).json({
            message: "File wajib diupload"
        });
    }

    const sql = `
        UPDATE request_surat
        SET file_balasan = ?
        WHERE id_request = ?
    `;

    db.query(sql, [file_balasan, id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal upload file",
                error: err
            });
        }

        res.json({
            message: "File balasan berhasil diupload",
            file: file_balasan
        });
    });
};


// ✅ DOWNLOAD FILE (DOSEN)
exports.downloadFile = (req, res) => {
    const filename = req.params.filename;

    const filePath = path.join(__dirname, "../uploads", filename);

    res.download(filePath, (err) => {
        if (err) {
            return res.status(500).json({
                message: "File tidak ditemukan"
            });
        }
    });
};

exports.getStats = (req, res) => {

    const sql = `
        SELECT 
            COUNT(*) as total,
            SUM(status = 'pending') as pending,
            SUM(status = 'disetujui') as disetujui,
            SUM(status = 'ditolak') as ditolak
        FROM request_surat
    `;

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal mengambil statistik",
                error: err
            });
        }

        res.json(result[0]);
    });
};
