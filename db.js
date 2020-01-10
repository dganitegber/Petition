const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:petition:de168421@localhost:5432/cities");

exports.getCities = function() {
    return db
        .query(`SELECT id, population FROM cities`)
        .then(({ rows }) => rows);
};

exports.addSignature = function(first, last, signature) {
    return db.query(
        `INSERT INTO signature (first, last, signature) VALUES ('first', 'last', 'signature'); `,
        [first, last, signature]
    );
};
