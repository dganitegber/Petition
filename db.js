const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABSE_url ||
        "postgres:petition:de168421@localhost:5432/petition"
);

exports.getSignature = function(id) {
    return db.query(`SELECT signature FROM signatures WHERE user_id = $1`, [
        id
    ]);
};

exports.addSignature = function(signature, id) {
    return db.query(
        `INSERT INTO signatures (signature, user_id) VALUES ($1, $2) RETURNING id`,
        [signature, id]
    );
};

exports.getAll = function() {
    return db.query("SELECT * FROM signatures WHERE id > 0");
};

exports.getFirstName = function(id) {
    return db.query("SELECT first, last FROM users WHERE id = $1", [id]);
};

exports.getLastName = function(id) {
    return db.query("SELECT last FROM users WHERE id=$1", [id]);
};

exports.addUser = function(first, last, email, password) {
    return db.query(
        `INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING id`,
        [first, last, email, password]
    );
};

exports.findPassword = function(email) {
    return db.query("SELECT password FROM users WHERE email = $1", [email]);
};

exports.findIdByEmail = function(email) {
    return db.query("SELECT id FROM users WHERE email = $1", [email]);
};
