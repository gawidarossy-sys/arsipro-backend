// Tambahan route untuk update profil user (nama, email, jabatan, password)
// dan upload foto profil. Sesuaikan bagian yang ditandai "// SESUAIKAN"
// dengan struktur project backend kamu (koneksi DB, nama tabel/kolom, middleware JWT).

const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcrypt');
const multer  = require('multer');
const path    = require('path');

const db = require('../db');                       // SESUAIKAN: path ke koneksi mysql2/promise kamu
const authenticateToken = require('../middleware/auth'); // SESUAIKAN: path middleware JWT kamu

// ── Konfigurasi upload foto profil ──
const storageFoto = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),  // SESUAIKAN: folder uploads kamu
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `foto_${req.params.id}_${Date.now()}${ext}`);
  }
});

const uploadFoto = multer({
  storage: storageFoto,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB, samakan dengan batas di frontend
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('File harus berupa gambar (JPG/PNG).'));
    }
    cb(null, true);
  }
});

// ── PUT /api/users/:id  → update nama, email, jabatan, password (opsional) ──
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { nama, email, jabatan, password } = req.body;

  if (!nama || !email) {
    return res.status(400).json({ message: 'Nama dan email wajib diisi.' });
  }

  try {
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      await db.query(
        'UPDATE users SET nama = ?, email = ?, jabatan = ?, password = ? WHERE id_user = ?', // SESUAIKAN: nama tabel/kolom
        [nama, email, jabatan, hashed, id]
      );
    } else {
      await db.query(
        'UPDATE users SET nama = ?, email = ?, jabatan = ? WHERE id_user = ?', // SESUAIKAN: nama tabel/kolom
        [nama, email, jabatan, id]
      );
    }

    res.json({ message: 'Profil berhasil diperbarui.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal memperbarui profil.' });
  }
});

// ── PUT /api/users/:id/foto  → upload/ganti foto profil ──
router.put('/:id/foto', authenticateToken, uploadFoto.single('foto'), async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({ message: 'File foto tidak ditemukan.' });
  }

  try {
    await db.query('UPDATE users SET foto = ? WHERE id_user = ?', [req.file.filename, id]); // SESUAIKAN: nama tabel/kolom
    res.json({ message: 'Foto berhasil diperbarui.', foto: req.file.filename });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menyimpan foto.' });
  }
});

module.exports = router;

/*
Cara pasang di file utama (misal app.js / index.js / server.js):

  const userRoutes = require('./routes/users-profile-routes'); // sesuaikan nama file & path
  app.use('/api/users', userRoutes);

Kalau kamu sudah punya file routes/users.js sebelumnya (misal untuk GET list user / login),
cukup tambahkan dua route (router.put('/:id', ...) dan router.put('/:id/foto', ...)) ke file
itu saja — tidak perlu file baru, biar nggak ada konflik path /api/users yang didaftarkan dua kali.
*/