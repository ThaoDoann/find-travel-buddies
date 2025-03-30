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
        ('Alice Johnson', 'alice@example.com', '$2b$10$znxyRZDopPa4ZQM67v8wAu3hxDNJACPtJSyDDoM3SQWwcBXSbZ8.m', 'Mountain View, CA', NULL, 'Love traveling!'),
        ('Bob Smith', 'bob@example.com', '$2b$10$znxyRZDopPa4ZQM67v8wAu3hxDNJACPtJSyDDoM3SQWwcBXSbZ8.m', 'Toronto, ON', NULL, 'Adventure seeker.'),
        ('Charlie Brown', 'charlie@example.com', '$2b$10$znxyRZDopPa4ZQM67v8wAu3hxDNJACPtJSyDDoM3SQWwcBXSbZ8.m', 'Etobicoke, ON', NULL, 'Looking for travel buddies!'),
        ('David Wilson', 'david@example.com', '$2b$10$znxyRZDopPa4ZQM67v8wAu3hxDNJACPtJSyDDoM3SQWwcBXSbZ8.m', 'York, ON', NULL, 'Mountain climber.'),
        ('Emily Davis', 'emily@example.com', '$2b$10$znxyRZDopPa4ZQM67v8wAu3hxDNJACPtJSyDDoM3SQWwcBXSbZ8.m', 'Cupertino, CA', NULL, 'Food enthusiast.'),
        ('Frank Green', 'frank@example.com', '$2b$10$znxyRZDopPa4ZQM67v8wAu3hxDNJACPtJSyDDoM3SQWwcBXSbZ8.m', 'Seattle, WA', NULL, 'Hiking lover.'),
        ('Grace Lee', 'grace@example.com', '$2b$10$znxyRZDopPa4ZQM67v8wAu3hxDNJACPtJSyDDoM3SQWwcBXSbZ8.m', 'Boston, MA', NULL, 'Cultural explorer.'),
        ('Henry White', 'henry@example.com', '$2b$10$znxyRZDopPa4ZQM67v8wAu3hxDNJACPtJSyDDoM3SQWwcBXSbZ8.m', 'Chicago, IL', NULL, 'Backpacking pro.'),
        ('Ivy Adams', 'ivy@example.com', '$2b$10$znxyRZDopPa4ZQM67v8wAu3hxDNJACPtJSyDDoM3SQWwcBXSbZ8.m', 'Vancouver, BC', NULL, 'Skiing enthusiast.'),
        ('Jack Miller', 'jack@example.com', '$2b$10$znxyRZDopPa4ZQM67v8wAu3hxDNJACPtJSyDDoM3SQWwcBXSbZ8.m', 'Austin, TX', NULL, 'Music festival lover.'),
        ('Sarah Chen', 'sarah@example.com', '$2b$10$znxyRZDopPa4ZQM67v8wAu3hxDNJACPtJSyDDoM3SQWwcBXSbZ8.m', 'San Francisco, CA', NULL, 'Photography enthusiast.'),
        ('Mike Johnson', 'mike@example.com', '$2b$10$znxyRZDopPa4ZQM67v8wAu3hxDNJACPtJSyDDoM3SQWwcBXSbZ8.m', 'Denver, CO', NULL, 'Rock climbing expert.'),
        ('Lisa Wong', 'lisa@example.com', '$2b$10$znxyRZDopPa4ZQM67v8wAu3hxDNJACPtJSyDDoM3SQWwcBXSbZ8.m', 'New York, NY', NULL, 'City explorer.'),
        ('Tom Anderson', 'tom@example.com', '$2b$10$znxyRZDopPa4ZQM67v8wAu3hxDNJACPtJSyDDoM3SQWwcBXSbZ8.m', 'Miami, FL', NULL, 'Beach lover.'),
        ('Rachel Kim', 'rachel@example.com', '$2b$10$znxyRZDopPa4ZQM67v8wAu3hxDNJACPtJSyDDoM3SQWwcBXSbZ8.m', 'Seoul, SK', NULL, 'K-pop fan.')
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
        ('Music Festival'), ('Sports & Adventure'), ('Shopping'), ('Nightlife'),
        ('Romantic'), ('Educational'), ('Spiritual'), ('Wildlife'),
        ('Extreme Sports'), ('Gastronomy'), ('Art & Culture'), ('Eco-Tourism')
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
        (1, 'Beach Vacation', 6, '2025-06-01', '2025-06-10', 'Hawaii', 2000, 'Enjoying the sun and sand.', 2),
        (2, 'Mountain Hiking', 5, '2025-07-01', '2025-07-15', 'Colorado', 1500, 'Exploring rocky terrains.', 3),
        (3, 'City Exploration', 3, '2025-08-01', '2025-08-10', 'New York', 2500, 'Museums and landmarks tour.', 4),
        (4, 'Road Trip', 8, '2025-09-01', '2025-09-05', 'California', 1000, 'Scenic drives and camping.', 3),
        (5, 'Safari Adventure', 15, '2025-10-01', '2025-10-15', 'Kenya', 3000, 'Exploring African savannahs.', 4),
        (6, 'Skiing Trip', 14, '2025-11-01', '2025-11-10', 'Switzerland', 3500, 'Snowboarding and skiing.', 6),
        (7, 'Food & Wine Tour', 16, '2025-12-01', '2025-12-10', 'Italy', 2800, 'Tasting local cuisines.', 8),
        (8, 'Camping Retreat', 7, '2026-01-01', '2026-01-10', 'Alaska', 1800, 'Living in the wild.', 2),
        (9, 'Photography Expedition', 17, '2026-02-01', '2026-02-07', 'Iceland', 2200, 'Capturing northern lights.', 1),
        (10, 'Music Festival Tour', 19, '2026-03-01', '2026-03-07', 'Coachella', 1200, 'Attending live concerts.', 2),
        (11, 'Shopping Spree', 21, '2026-04-01', '2026-04-10', 'Tokyo', 2500, 'Exploring fashion districts.', 3),
        (12, 'Rock Climbing', 27, '2026-05-01', '2026-05-15', 'Yosemite', 1800, 'Climbing famous routes.', 4),
        (13, 'Nightlife Tour', 22, '2026-06-01', '2026-06-07', 'Las Vegas', 2000, 'Exploring the strip.', 6),
        (14, 'Romantic Getaway', 23, '2026-07-01', '2026-07-10', 'Paris', 3000, 'City of love.', 2),
        (15, 'Educational Tour', 24, '2026-08-01', '2026-08-15', 'London', 2800, 'Historical sites and museums.', 5)
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
        (3, 1, 'Approved'),
        (5, 1, 'Pending'),
        (6, 1, 'Rejected'),
        (4, 2, 'Pending'),
        (5, 2, 'Approved'),
        (6, 3, 'Pending'),
        (7, 3, 'Rejected'),
        (8, 4, 'Pending'),
        (9, 4, 'Approved'),
        (10, 5, 'Pending'),
        (1, 6, 'Pending'),
        (2, 7, 'Approved'),
        (3, 7, 'Pending'),
        (4, 8, 'Rejected'),
        (5, 8, 'Pending'),
        (6, 9, 'Approved'),
        (7, 9, 'Pending'),
        (8, 10, 'Pending'),
        (9, 10, 'Approved'),
        (10, 1, 'Pending'),
        (1, 2, 'Pending'),
        (11, 11, 'Approved'),
        (12, 11, 'Pending'),
        (13, 12, 'Approved'),
        (14, 12, 'Pending'),
        (15, 13, 'Approved'),
        (1, 13, 'Pending'),
        (2, 14, 'Approved'),
        (3, 14, 'Pending'),
        (4, 15, 'Approved'),
        (5, 15, 'Pending')
    `);

    // Update companions count for all trips
    db.run(`UPDATE Trips SET companionsCount = (
        SELECT COUNT(*) 
        FROM TripRequests 
        WHERE TripRequests.tripId = Trips.tripId 
        AND TripRequests.status = 'Approved'
    )`);

    // Create Connections table
    db.run(`CREATE TABLE Connections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        requester_id INTEGER NOT NULL,
        recipient_id INTEGER NOT NULL,
        status TEXT CHECK( status IN ('Pending', 'Accepted', 'Declined') ) DEFAULT 'Pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (requester_id) REFERENCES Users(userId),
        FOREIGN KEY (recipient_id) REFERENCES Users(userId)
    )`);

    // Insert Dummy Connections
    db.run(`INSERT INTO Connections (requester_id, recipient_id, status) VALUES
        (1, 2, 'Accepted'),
        (1, 3, 'Pending'),
        (1, 4, 'Declined'),
        (2, 3, 'Accepted'),
        (2, 4, 'Pending'),
        (3, 4, 'Accepted'),
        (5, 1, 'Pending'),
        (6, 2, 'Accepted'),
        (7, 3, 'Pending'),
        (8, 4, 'Declined'),
        (9, 5, 'Accepted'),
        (10, 6, 'Pending'),
        (11, 7, 'Accepted'),
        (12, 8, 'Pending'),
        (13, 9, 'Accepted'),
        (14, 10, 'Pending'),
        (15, 1, 'Declined')
    `);

    // Create Chat table
    db.run(`CREATE TABLE Chat (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        recipient_id INTEGER NOT NULL,
        message TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES Users(userId),
        FOREIGN KEY (recipient_id) REFERENCES Users(userId)
    )`);

    // Insert Dummy Chat messages
    db.run(`INSERT INTO Chat (sender_id, recipient_id, message) VALUES
        (1, 2, 'Hey, are you interested in joining my trip?'),
        (2, 1, 'Yes, that sounds great!'),
        (3, 4, 'Would you like to be travel buddies?'),
        (4, 3, 'Sure, let''s plan something!'),
        (5, 6, 'I''m looking for someone to travel with.'),
        (6, 5, 'I''d love to join you!'),
        (7, 8, 'Are you free for a trip next month?'),
        (8, 7, 'Yes, I''m interested!'),
        (9, 10, 'Let''s plan an adventure together!'),
        (10, 9, 'That sounds exciting!'),
        (11, 12, 'Would you like to join my photography trip?'),
        (12, 11, 'Yes, I''d love to!'),
        (13, 14, 'Are you interested in a shopping trip?'),
        (14, 13, 'That would be fun!'),
        (15, 1, 'Let''s plan something together!')
    `);

    console.log("Database initialized successfully with dummy data.");
});

db.close();
