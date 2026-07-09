const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    console.log("HEADER:", authHeader); // 🔥

    if (!authHeader) {
        return res.status(403).json({
            message: "token tidak ada"
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(403).json({
            message: "format token salah"
        });
    }
    
    console.log("TOKEN MASUK:", token);
    console.log("PANJANG TOKEN MASUK:", token.length);

    jwt.verify(token, "secretkey123", (err, decoded) => {
        if (err) {
            console.log("TOKEN ERROR:", err); // 🔥 tambahin ini
            return res.status(401).json({
                message: "token tidak valid"
            });
        }

        req.user = decoded;
        next();
    });
};