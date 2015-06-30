CREATE DATABASE IF NOT EXISTS MarkovDB;
use `MarkovDB`;

CREATE TABLE IF NOT EXISTS chain (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    link1 VARCHAR(512),
    link2 VARCHAR(512),
    n INT
);

CREATE INDEX idx_link1 ON chain (link1(10));
CREATE INDEX idx_links ON chain (link1(10), link2(10));
