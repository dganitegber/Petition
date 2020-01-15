const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
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

exports.getSigners = function() {
    return db.query(
        "SELECT first, last, city, age FROM users JOIN signatures ON users.id = signatures.user_id JOIN profiles ON profiles.user_id = signatures.user_id"
    );
};

exports.getName = function(id) {
    return db.query("SELECT first, last FROM users WHERE id = $1", [id]);
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

exports.userProfile = function(age, city, url, user_id) {
    return db.query(
        `INSERT INTO profiles (age, city, url, user_id) VALUES ($1, $2, $3, $4) RETURNING id`,
        [age, city, url, user_id]
    );
};

exports.signersList = function() {
    return db.query(
        "SELECT first, last, city, age FROM users JOIN profiles ON users.id = user_id JOIN signatures ON profiles.user_id = signatures.user_id",
        []
    );
};
