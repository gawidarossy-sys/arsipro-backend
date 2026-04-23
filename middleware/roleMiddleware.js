const isAdmin = (req, res, next) => {
    const role = req.body?.role || req.headers.role;

    if (!role) {
        return res.status(400).json({
            message: "Role tidak ditemukan"
        });
    }

    if (role !== "admin") {
        return res.status(403).json({
            message: "Akses hanya untuk admin"
        });
    }

    next();
};

const isDosen = (req, res, next) => {
    const role = req.body?.role || req.headers.role;

    if (!role) {
        return res.status(400).json({
            message: "Role tidak ditemukan"
        });
    }

    if (role !== "dosen") {
        return res.status(403).json({
            message: "Akses hanya untuk dosen"
        });
    }

    next();
};

module.exports = {
    isAdmin,
    isDosen
};