import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

const dbDir = path.resolve("db");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

const db = new Database("./db/emailSystem.sqlite");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    PRIMARY KEY(id)
);
  CREATE TABLE IF NOT EXISTS  mails (
    id INTEGER,
    is_reply_to INTEGER,
    sender_id INTEGER,
    receiver_id INTEGER,
    subject TEXT,
    body TEXT NOT NULL,
    time NUMERIC DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id),
    FOREIGN KEY (is_reply_to) REFERENCES mails (id),
    FOREIGN KEY (sender_id) REFERENCES users (id),
    FOREIGN KEY (receiver_id) REFERENCES users (id)
);
`);

export default db;
