

DROP TABLE IF EXISTS profiles;
CREATE TABLE profiles (
id SERIAL PRIMARY KEY,
age INT,
city VARCHAR(255),
url VARCHAR(255),
user_id INT REFERENCES users(id) NOT NULL UNIQUE
);
