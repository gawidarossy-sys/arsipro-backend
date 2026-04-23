const db = require("../config/database");

// tambah kategori
exports.createKategori = (req, res) => {

    const { nama_kategori, deskripsi } = req.body;

    if (!nama_kategori) {
        return res.status(400).json({
            message: "nama kategori wajib diisi"
        });
    }

    const sql = `
        INSERT INTO kategori_surat (nama_kategori, deskripsi)
        VALUES (?, ?)
    `;

    db.query(sql, [nama_kategori, deskripsi], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json({
                message: "gagal menambah kategori"
            });
        }

        res.status(201).json({
            message: "kategori berhasil ditambahkan"
        });
    });
};


// ambil semua kategori
exports.getAllKategori = (req, res) => {

    const sql = "SELECT * FROM kategori_surat";

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "gagal mengambil data"
            });
        }

        res.json(results);
    });
};


// ambil kategori by id
exports.getKategoriById = (req, res) => {

    const id = req.params.id;

    const sql = "SELECT * FROM kategori_surat WHERE id_kategori = ?";

    db.query(sql, [id], (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "database error"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "kategori tidak ditemukan"
            });
        }

        res.json(results[0]);
    });
};


// update kategori
exports.updateKategori = (req, res) => {

    const id = req.params.id;
    const { nama_kategori, deskripsi } = req.body;

    const sql = `
        UPDATE kategori_surat
        SET nama_kategori = ?, deskripsi = ?
        WHERE id_kategori = ?
    `;

    db.query(sql, [nama_kategori, deskripsi, id], (err, result) => {

        if (err) {
            return res.status(500).json({
                message: "gagal update kategori"
            });
        }

        res.json({
            message: "kategori berhasil diupdate"
        });
    });
};


// hapus kategori
exports.deleteKategori = (req, res) => {

    const id = req.params.id;

    const sql = "DELETE FROM kategori_surat WHERE id_kategori = ?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            return res.status(500).json({
                message: "gagal menghapus kategori"
            });
        }

        res.json({
            message: "kategori berhasil dihapus"
        });
    });
};