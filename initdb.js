const sqlite3 = require("sqlite3").verbose();

// Connect to the database (creates "database.db" if it doesn't exist)
const db = new sqlite3.Database("database.db");

db.serialize(function () {
    // Drop existing tables (for testing purposes)
    db.run("DROP TABLE IF EXISTS Users");

    // Create tables
    db.run(`CREATE TABLE users (
        userId INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        address TEXT,
        avatar BLOB,
        bio TEXT
    )`);

    // Insert Dummy data (no avatars for now)
    db.run(`INSERT INTO users (name, email, password, address, avatar, bio) VALUES 
        ('Alice Johnson', 'alice@example.com', 'password123', '1600 Amphitheatre Parkway, Mountain View, CA', NULL, 'Love traveling to Europe!'),
        ('Bob Smith', 'bob@example.com', 'password456', '754 Yonge St, Toronto, ON M4Y 2B6', NULL, 'Adventure seeker.'),
        ('Charlie Brown', 'charlie@example.com', 'password789', '634 Dixon Rd, Etobicoke, ON M9W 1J1', NULL, 'Looking for travel buddies!'),
        ('David Wilson', 'david@example.com', 'securepass', '1409 Lawrence Ave W, York, ON M6L 1A4', NULL, 'Mountain climber and backpacker.'),
        ('Emily Davis', 'emily@example.com', 'mypassword', '10155 Barbara Ln, Cupertino, CA 95014, United States', NULL, 'Food and culture enthusiast.')`
    );

    console.log("Database initialized successfully.");
});

db.close();
