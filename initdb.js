const sqlite3 = require("sqlite3").verbose();

// Connect to the database (creates "database.db" if it doesn't exist)
const db = new sqlite3.Database("database.db");

db.serialize(function () {
    // Drop existing tables (for testing purposes)
    db.run("DROP TABLE IF EXISTS Users");
    db.run("DROP TABLE IF EXISTS Trips");
    db.run("DROP TABLE IF EXISTS TripTypes");
    db.run("DROP TABLE IF EXISTS TripRequests");
    db.run("DROP TABLE IF EXISTS Connections");
    db.run("DROP TABLE IF EXISTS Chat");

    // Create tables
    db.run(`CREATE TABLE users (
        userId INTEGER PRIMARY KEY AUTOINCREMENT,
        userName TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        address TEXT,
        avatar BLOB,
        bio TEXT
    )`);

    // Insert Dummy data (no avatars for now)
    db.run(`INSERT INTO Users (userName, email, password, address, avatar, bio) VALUES 
        ('Alice Johnson', 'alice@example.com', '$2b$10$mURd9TpcBgP/hZa/1B8j.ukbklCIGijEUi2QRU0ZO9CElEJ9t2Tfi', 'Mountain View, CA', NULL, 'Love traveling!'),
        ('Bob Smith', 'bob@example.com', '$2b$10$mURd9TpcBgP/hZa/1B8j.ukbklCIGijEUi2QRU0ZO9CElEJ9t2Tfi', 'Toronto, ON', NULL, 'Adventure seeker.'),
        ('Charlie Brown', 'charlie@example.com', '$2b$10$mURd9TpcBgP/hZa/1B8j.ukbklCIGijEUi2QRU0ZO9CElEJ9t2Tfi', 'Etobicoke, ON', NULL, 'Looking for travel buddies!'),
        ('David Wilson', 'david@example.com', '$2b$10$mURd9TpcBgP/hZa/1B8j.ukbklCIGijEUi2QRU0ZO9CElEJ9t2Tfi', 'York, ON', NULL, 'Mountain climber.'),
        ('Emily Davis', 'emily@example.com', '$2b$10$mURd9TpcBgP/hZa/1B8j.ukbklCIGijEUi2QRU0ZO9CElEJ9t2Tfi', 'Cupertino, CA', NULL, 'Food enthusiast.'),
        ('Frank Green', 'frank@example.com', '$2b$10$mURd9TpcBgP/hZa/1B8j.ukbklCIGijEUi2QRU0ZO9CElEJ9t2Tfi', 'Seattle, WA', NULL, 'Hiking lover.'),
        ('Grace Lee', 'grace@example.com', '$2b$10$mURd9TpcBgP/hZa/1B8j.ukbklCIGijEUi2QRU0ZO9CElEJ9t2Tfi', 'Boston, MA', NULL, 'Cultural explorer.'),
        ('Henry White', 'henry@example.com', '$2b$10$mURd9TpcBgP/hZa/1B8j.ukbklCIGijEUi2QRU0ZO9CElEJ9t2Tfi', 'Chicago, IL', NULL, 'Backpacking pro.'),
        ('Ivy Adams', 'ivy@example.com', '$2b$10$mURd9TpcBgP/hZa/1B8j.ukbklCIGijEUi2QRU0ZO9CElEJ9t2Tfi', 'Vancouver, BC', NULL, 'Skiing enthusiast.'),
        ('Jack Miller', 'jack@example.com', '$2b$10$mURd9TpcBgP/hZa/1B8j.ukbklCIGijEUi2QRU0ZO9CElEJ9t2Tfi', 'Austin, TX', NULL, 'Music festival lover.')
    `);


    // Create TripTypes table
    db.run(`CREATE TABLE TripTypes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    )`);

    // Insert Dummy TripTypes
    db.run(`INSERT INTO TripTypes (name) VALUES 
        ('Adventure'), ('Relaxation'), ('Cultural'), ('Family'), ('Hiking'),
        ('Beach'), ('Cruise'), ('Camping'), ('Road Trip'), ('Wellness & Spa'),
        ('Luxury'), ('Backpacking'), ('Historical'), ('Skiing & Snowboarding'),
        ('Safari'), ('Food & Wine'), ('Photography'), ('Volunteering'),
        ('Music Festival'), ('Sports & Adventure')
    `);

    // Create Trips table
    db.run(`CREATE TABLE Trips (
        tripId INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        tripName TEXT NOT NULL,
        tripTypeId INTEGER NOT NULL,
        startDate TEXT NOT NULL,
        endDate TEXT NOT NULL,
        location TEXT NOT NULL,
        budget REAL NOT NULL,
        description TEXT NOT NULL,
        companionsCount INTEGER DEFAULT 0,
        maxCompanions INTEGER NOT NULL,
        status TEXT CHECK(status IN ('Planned', 'Completed', 'Canceled')) DEFAULT 'Planned',
        FOREIGN KEY (userId) REFERENCES Users (userId),
        FOREIGN KEY (tripTypeId) REFERENCES TripTypes (id)
    )`);

    // Insert Dummy Trips
    db.run(`INSERT INTO Trips (userId, tripName, tripTypeId, startDate, endDate, location, budget, description, maxCompanions) VALUES 
        (1, 'Beach Vacation', 6, '2025-06-01', '2025-06-10', 'Hawaii', 2000,  'Enjoying the sun and sand.', 2),
        (2, 'Mountain Hiking', 5, '2025-07-01', '2025-07-15', 'Colorado', 1500, 'Exploring rocky terrains.', 3),
        (3, 'City Exploration', 3, '2025-08-01', '2025-08-10', 'New York', 2500, 'Museums and landmarks tour.', 4),
        (4, 'Road Trip', 8, '2025-09-01', '2025-09-05', 'California', 1000, 'Scenic drives and camping.', 3),
        (5, 'Safari Adventure', 15, '2025-10-01', '2025-10-15', 'Kenya', 3000,  'Exploring African savannahs.', 4),
        (6, 'Skiing Trip', 14, '2025-11-01', '2025-11-10', 'Switzerland', 3500, 'Snowboarding and skiing.', 6),
        (7, 'Food & Wine Tour', 16, '2025-12-01', '2025-12-10', 'Italy', 2800, 'Tasting local cuisines.', 8),
        (8, 'Camping Retreat', 7, '2026-01-01', '2026-01-10', 'Alaska', 1800, 'Living in the wild.', 2),
        (9, 'Photography Expedition', 17, '2026-02-01', '2026-02-07', 'Iceland', 2200, 'Capturing northern lights.', 1),
        (10, 'Music Festival Tour', 19, '2026-03-01', '2026-03-07', 'Coachella', 1200, 'Attending live concerts.', 2)
    `);


     // Create TripRequests table
     db.run(`CREATE TABLE TripRequests (
        requestId INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        tripId INTEGER NOT NULL,
        status TEXT CHECK(status IN ('Pending', 'Approved', 'Rejected')) DEFAULT 'Pending',
        requestDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES Users (userId),
        FOREIGN KEY (tripId) REFERENCES Trips (tripId)
    )`);

    // Insert Dummy TripRequests
    db.run(`INSERT INTO TripRequests (userId, tripId, status) VALUES
        (2, 1, 'Pending'),
        (3, 1, 'Pending'),
        (4, 2, 'Pending'),
        (5, 2, 'Pending'),
        (6, 3, 'Pending'),
        (7, 3, 'Pending'),
        (8, 4, 'Pending'),
        (9, 4, 'Pending'),
        (10, 5, 'Pending'),
        (1, 6, 'Pending')
    `);

});

db.close();
