const db = require("../config/database");

// ADMIN kirim surat ke dosen/mahasiswa
exports.kirimSurat = (req, res) => {
    const { id_penerima, judul_surat, kategori, deskripsi, role_penerima } = req.body;
    const file_surat = req.file ? req.file.filename : null;

    if (!id_penerima || !judul_surat || !file_surat) {
        return res.status(400).json({ message: "Data tidak lengkap" });
    }

    const sql = `
        INSERT INTO surat_dosen (id_penerima, judul_surat, kategori, deskripsi, file_surat, role_penerima)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [id_penerima, judul_surat, kategori, deskripsi, file_surat, role_penerima || 'dosen'], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Gagal kirim surat", error: err });
        }
        res.status(201).json({ message: "Surat berhasil dikirim" });
    });
};

// DOSEN/MAHASISWA lihat surat masuk miliknya
exports.getSuratMasukDosen = (req, res) => {
    const id_user = req.user.id;

    const sql = `
        SELECT surat_dosen.*, users.nama as nama_pengirim
        FROM surat_dosen
        JOIN users ON surat_dosen.id_penerima = users.id_user
        WHERE surat_dosen.id_penerima = ?
        ORDER BY surat_dosen.created_at DESC
    `;

    db.query(sql, [id_user], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Gagal mengambil surat", error: err });
        }
        res.json(result);
    });
};

// ADMIN lihat semua surat yang sudah dikirim (filter by role_penerima)
exports.getAllSuratDikirim = (req, res) => {
    const { role_penerima } = req.query;

    let sql = `
        SELECT surat_dosen.*, users.nama as nama_penerima, users.role
        FROM surat_dosen
        JOIN users ON surat_dosen.id_penerima = users.id_user
        WHERE 1=1
    `;

    let values = [];

    if (role_penerima) {
        sql += ` AND surat_dosen.role_penerima = ?`;
        values.push(role_penerima);
    }

    sql += ` ORDER BY surat_dosen.created_at DESC`;

    db.query(sql, values, (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Gagal mengambil data", error: err });
        }
        res.json(result);
    });
};

// HAPUS surat
exports.deleteSurat = (req, res) => {
    const { id } = req.params;

    db.query("DELETE FROM surat_dosen WHERE id_surat = ?", [id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Gagal hapus surat", error: err });
        }
        res.json({ message: "Surat berhasil dihapus" });
    });
};