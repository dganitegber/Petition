const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:petition:de168421@localhost:5432/petition");

exports.getSignature = function() {
    return db
        .query(`SELECT signature FROM signatures`)
        .then(({ rows }) => rows);
};

exports.addSignature = function(first, last, signature) {
    console.log(first);
    return db.query(
        `INSERT INTO signatures (first, last, signature) VALUES ($1, $2, $3) RETURNING id`,
        [first, last, signature]
    );
};

exports.getAll = function() {
    return db.query("SELECT * FROM signatures");
};

exports.countEntries = function() {
    return db.query("SELECT id FROM signatures;");
};
