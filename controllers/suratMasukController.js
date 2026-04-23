const db = require("../config/database");

// ==========================
// GET semua surat masuk
// ==========================
exports.getAllSuratMasuk = (req, res) => {
  const sql = `
    SELECT 
      surat_masuk.*, 
      kategori_surat.nama_kategori
    FROM surat_masuk
    JOIN kategori_surat 
    ON surat_masuk.id_kategori = kategori_surat.id_kategori
    ORDER BY surat_masuk.created_at DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json(result);
  });
};

// ==========================
// TAMBAH surat masuk + upload file
// ==========================
exports.tambahSuratMasuk = (req, res) => {
  const {
    no_surat,
    nama_pengirim,
    instansi,
    id_kategori,
    tanggal_surat
  } = req.body;

  const file_surat = req.file ? req.file.filename : null;

  const sql = `
    INSERT INTO surat_masuk
    (no_surat, nama_pengirim, instansi, file_surat, id_kategori, tanggal_surat)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      no_surat,
      nama_pengirim,
      instansi,
      file_surat,
      id_kategori,
      tanggal_surat
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        message: "Surat masuk berhasil ditambahkan",
        file: file_surat
      });
    }
  );
};