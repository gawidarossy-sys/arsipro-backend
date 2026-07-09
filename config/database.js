const mysql = require("mysql2");

const pool = mysql.createPool({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "arsipro",
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

pool.getConnection((err, connection) => {
    if (err) {
        console.log("Database error:", err);
    } else {
        console.log("Database terhubung (pool)");
        connection.release();
    }
});

module.exports = pool;