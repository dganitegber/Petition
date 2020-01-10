

DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures(
    id SERIAL PRIMARY KEY,
    first VARCHAR NOT NULL CHECK (first != ''),
    last VARCHAR NOT NULL CHECK (last != ''),
    signature VARCHAR NOT NULL CHECK (signature != '')
);

INSERT INTO signatures (first, last, signature) VALUES ('Dganit', 'Eger', 'sig');
INSERT INTO signatures (first, last, signature) VALUES ('John', 'Doe', 'sig');
INSERT INTO signatures (first, last, signature) VALUES ('Dganit', 'Eger', 'sig');
