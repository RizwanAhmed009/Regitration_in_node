const sql = require("mysql2");
require("dotenv").config(); 
const db = sql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  }).promise();
  
  // Check if database is connected
  db.query("SELECT 1")
    .then(() => console.log(" Connected to MySQL Database!"))
    .catch((err) => console.error(" Database connection failed:", err.message));
  
  module.exports = db;