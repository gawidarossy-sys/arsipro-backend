exports.getAllSuratKeluar = (req, res) => {
    const { search, id_kategori, page = 1, limit = 5 } = req.query;

    const offset = (page - 1) * limit;

    let sql = "SELECT * FROM surat_keluar WHERE 1=1";
    let countSql = "SELECT COUNT(*) as total FROM surat_keluar WHERE 1=1";
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