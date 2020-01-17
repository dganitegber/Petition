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
        "SELECT users.first, users.last, profiles.age, profiles.city FROM signatures LEFT JOIN profiles on signatures.user_id = profiles.user_id LEFT JOIN users on signatures.user_id = users.id"
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
        "SELECT * FROM users JOIN profiles ON users.id = user_id JOIN signatures ON profiles.user_id = signatures.user_id",
        []
    );
};

exports.getNameAndSignature = function(id) {
    return db.query(
        "SELECT first, last, signature FROM users JOIN signatures ON users.id = signatures.user_id WHERE users.id=$1",
        [id]
    );
};

exports.countSigners = function() {
    return db.query("SELECT COUNT(*) FROM signatures");
};

exports.getSignersByCity = function(city) {
    return db.query(
        `SELECT users.first, users.last, signatures.signature, profiles.age, profiles.city, profiles.url FROM users JOIN signatures ON signatures.user_id = users.id JOIN profiles ON profiles.user_id = users.id WHERE LOWER (profiles.city) = LOWER($1)`,
        [city]
    );
};
