const sqlite3 = require("sqlite3").verbose();

// Connect to the database (creates "database.db" if it doesn't exist)
const db = new sqlite3.Database("database.db");

db.serialize(function () {
    // Drop existing tables (for testing purposes)
    db.run("DROP TABLE IF EXISTS Users");

    // Create Users Table with avatar as BLOB
    db.run(`CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        avatar BLOB,
        bio TEXT
    )`);

    // Insert Dummy data (no avatars for now)
    db.run(`INSERT INTO users (name, email, password, avatar, bio) VALUES 
        ('Alice Johnson', 'alice@example.com', 'password123', NULL, 'Love traveling to Europe!'),
        ('Bob Smith', 'bob@example.com', 'password456', NULL, 'Adventure seeker.'),
        ('Charlie Brown', 'charlie@example.com', 'password789', NULL, 'Looking for travel buddies!'),
        ('David Wilson', 'david@example.com', 'securepass', NULL, 'Mountain climber and backpacker.'),
        ('Emily Davis', 'emily@example.com', 'mypassword', NULL, 'Food and culture enthusiast.')`
    );

    console.log("Database initialized successfully.");
});

db.close();
