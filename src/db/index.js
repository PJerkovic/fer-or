const { Pool } = require("pg");

console.log({ url: process.env.DB_URL });
const pool = new Pool({
    connectionString: process.env.DB_URL,
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};
