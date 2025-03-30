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
    db.run(`INSERT INTO Users (userId, userName, email, password, address, avatar, bio) VALUES 
        (1, 'Alice Johnson', 'alice@example.com', '$2b$10$znxyRZDopPa4ZQM67v8wAu3hxDNJACPtJSyDDoM3SQWwcBXSbZ8.m', 'Mountain View, CA', NULL, 'Love traveling!'),
        (2, 'Bob Smith', 'bob@example.com', '$2b$10$znxyRZDopPa4ZQM67v8wAu3hxDNJACPtJSyDDoM3SQWwcBXSbZ8.m', 'Toronto, ON', NULL, 'Adventure seeker.'),
        (3, 'Charlie Brown', 'charlie@example.com', '$2b$10$znxyRZDopPa4ZQM67v8wAu3hxDNJACPtJSyDDoM3SQWwcBXSbZ8.m', 'Etobicoke, ON', NULL, 'Looking for travel buddies!'),
        (4, 'David Wilson', 'david@example.com', '$2b$10$znxyRZDopPa4ZQM67v8wAu3hxDNJACPtJSyDDoM3SQWwcBXSbZ8.m', 'York, ON', NULL, 'Mountain climber.'),
        (5, 'Emily Davis', 'emily@example.com', '$2b$10$znxyRZDopPa4ZQM67v8wAu3hxDNJACPtJSyDDoM3SQWwcBXSbZ8.m', 'Cupertino, CA', NULL, 'Food enthusiast.'),
        (6, 'Frank Green', 'frank@example.com', '$2b$10$znxyRZDopPa4ZQM67v8wAu3hxDNJACPtJSyDDoM3SQWwcBXSbZ8.m', 'Seattle, WA', NULL, 'Hiking lover.'),
        (7, 'Grace Lee', 'grace@example.com', '$2b$10$znxyRZDopPa4ZQM67v8wAu3hxDNJACPtJSyDDoM3SQWwcBXSbZ8.m', 'Boston, MA', NULL, 'Cultural explorer.'),
        (8, 'Henry White', 'henry@example.com', '$2b$10$znxyRZDopPa4ZQM67v8wAu3hxDNJACPtJSyDDoM3SQWwcBXSbZ8.m', 'Chicago, IL', NULL, 'Backpacking pro.'),
        (9, 'Ivy Adams', 'ivy@example.com', '$2b$10$znxyRZDopPa4ZQM67v8wAu3hxDNJACPtJSyDDoM3SQWwcBXSbZ8.m', 'Vancouver, BC', NULL, 'Skiing enthusiast.'),
        (10, 'Jack Miller', 'jack@example.com', '$2b$10$znxyRZDopPa4ZQM67v8wAu3hxDNJACPtJSyDDoM3SQWwcBXSbZ8.m', 'Austin, TX', NULL, 'Music festival lover.'),
        (11, 'Sarah Chen', 'sarah@example.com', '$2b$10$znxyRZDopPa4ZQM67v8wAu3hxDNJACPtJSyDDoM3SQWwcBXSbZ8.m', 'San Francisco, CA', NULL, 'Photography enthusiast.'),
        (12, 'Mike Johnson', 'mike@example.com', '$2b$10$znxyRZDopPa4ZQM67v8wAu3hxDNJACPtJSyDDoM3SQWwcBXSbZ8.m', 'Denver, CO', NULL, 'Rock climbing expert.'),
        (13, 'Lisa Wong', 'lisa@example.com', '$2b$10$znxyRZDopPa4ZQM67v8wAu3hxDNJACPtJSyDDoM3SQWwcBXSbZ8.m', 'New York, NY', NULL, 'City explorer.'),
        (14, 'Tom Anderson', 'tom@example.com', '$2b$10$znxyRZDopPa4ZQM67v8wAu3hxDNJACPtJSyDDoM3SQWwcBXSbZ8.m', 'Miami, FL', NULL, 'Beach lover.'),
        (15, 'Rachel Kim', 'rachel@example.com', '$2b$10$znxyRZDopPa4ZQM67v8wAu3hxDNJACPtJSyDDoM3SQWwcBXSbZ8.m', 'Seoul, SK', NULL, 'K-pop fan.')
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
        isPublic BOOLEAN DEFAULT 1,
        status TEXT CHECK(status IN ('Planned', 'Completed', 'Canceled')) DEFAULT 'Planned',
        FOREIGN KEY (userId) REFERENCES Users (userId),
        FOREIGN KEY (tripTypeId) REFERENCES TripTypes (id)
    )`);

    // Insert Dummy Trips
    db.run(`INSERT INTO Trips (userId, tripName, tripTypeId, startDate, endDate, location, budget, description, maxCompanions, isPublic) VALUES 
        (1, 'Beach Vacation', 6, '2025-06-01', '2025-06-10', 'Hawaii', 2000, 'Enjoying the sun and sand.', 2, 1),
        (2, 'Mountain Hiking', 5, '2025-07-01', '2025-07-15', 'Colorado', 1500, 'Exploring rocky terrains.', 3, 0),
        (3, 'City Exploration', 3, '2025-08-01', '2025-08-10', 'New York', 2500, 'Museums and landmarks tour.', 4, 1),
        (4, 'Road Trip', 8, '2025-09-01', '2025-09-05', 'California', 1000, 'Scenic drives and camping.', 3, 1),
        (5, 'Safari Adventure', 15, '2025-10-01', '2025-10-15', 'Kenya', 3000, 'Exploring African savannahs.', 4, 0),
        (6, 'Skiing Trip', 14, '2025-11-01', '2025-11-10', 'Switzerland', 3500, 'Snowboarding and skiing.', 6, 1),
        (7, 'Food & Wine Tour', 16, '2025-12-01', '2025-12-10', 'Italy', 2800, 'Tasting local cuisines.', 8, 1),
        (8, 'Camping Retreat', 7, '2026-01-01', '2026-01-10', 'Alaska', 1800, 'Living in the wild.', 2, 0),
        (9, 'Photography Expedition', 17, '2026-02-01', '2026-02-07', 'Iceland', 2200, 'Capturing northern lights.', 1, 1),
        (10, 'Music Festival Tour', 19, '2026-03-01', '2026-03-07', 'Coachella', 1200, 'Attending live concerts.', 2, 1),
        (11, 'Shopping Spree', 21, '2026-04-01', '2026-04-10', 'Tokyo', 2500, 'Exploring fashion districts.', 3, 0),
        (12, 'Rock Climbing', 27, '2026-05-01', '2026-05-15', 'Yosemite', 1800, 'Climbing famous routes.', 4, 1),
        (13, 'Nightlife Tour', 22, '2026-06-01', '2026-06-07', 'Las Vegas', 2000, 'Exploring the strip.', 6, 1),
        (14, 'Romantic Getaway', 23, '2026-07-01', '2026-07-10', 'Paris', 3000, 'City of love.', 2, 0),
        (15, 'Educational Tour', 24, '2026-08-01', '2026-08-15', 'London', 2800, 'Historical sites and museums.', 5, 1),
        (1, 'Beach Adventure', 6, '2025-07-01', '2025-07-10', 'Maldives', 3000, 'Relaxing beach vacation with snorkeling.', 3, 1),
        (1, 'Mountain Trek', 5, '2025-08-15', '2025-08-25', 'Swiss Alps', 2500, 'Challenging mountain trek with amazing views.', 4, 1),
        (1, 'Food Tour', 16, '2025-09-01', '2025-09-10', 'Tokyo, Japan', 2000, 'Exploring Japanese cuisine and culture.', 5, 1)
    `);

    // Create TripRequests table
    db.run(`CREATE TABLE TripRequests (
        requestId INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        tripId INTEGER NOT NULL,
        status TEXT CHECK(status IN ('Pending', 'Approved', 'Rejected')) DEFAULT 'Pending',
        requestDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        message TEXT,
        FOREIGN KEY (userId) REFERENCES Users (userId),
        FOREIGN KEY (tripId) REFERENCES Trips (tripId)
    )`);

    // Insert Dummy TripRequests
    db.run(`INSERT INTO TripRequests (userId, tripId, status, message, requestDate) VALUES
        (2, 16, 'Pending', 'I love snorkeling and would love to join!', '2024-03-15'),
        (3, 16, 'Approved', 'Experienced swimmer here, can I join?', '2024-03-14'),
        (4, 16, 'Rejected', 'I want to learn snorkeling on this trip.', '2024-03-13'),
        (5, 17, 'Pending', 'I am an experienced hiker!', '2024-03-12'),
        (6, 17, 'Approved', 'Mountain climbing is my passion.', '2024-03-11'),
        (7, 17, 'Rejected', 'I have some hiking experience.', '2024-03-10'),
        (8, 18, 'Pending', 'Big fan of Japanese food!', '2024-03-09'),
        (9, 18, 'Approved', 'I speak Japanese and love the cuisine.', '2024-03-08'),
        (10, 18, 'Rejected', 'Would love to explore Tokyo with you.', '2024-03-07'),
        (1, 2, 'Pending', 'Hey, I would love to join your mountain hiking trip!', '2024-03-06'),
        (1, 3, 'Approved', 'I am very interested in exploring the city with you.', '2024-03-05'),
        (1, 4, 'Rejected', 'Would like to join your road trip.', '2024-03-04'),
        (1, 5, 'Pending', 'Safari sounds amazing! Can I join?', '2024-03-03'),
        (1, 6, 'Approved', 'I am an experienced skier, would love to join!', '2024-03-02'),
        (1, 7, 'Rejected', 'Food tours are my favorite!', '2024-03-01'),
        (1, 8, 'Pending', 'I love camping in Alaska! Would love to join.', '2024-03-16'),
        (1, 9, 'Pending', 'Photography is my hobby, Iceland sounds amazing!', '2024-03-17'),
        (1, 10, 'Pending', 'Big music festival fan here!', '2024-03-18'),
        (1, 11, 'Approved', 'Would love to explore Tokyo fashion.', '2024-03-19'),
        (1, 12, 'Rejected', 'Experienced in rock climbing.', '2024-03-20'),
        (1, 13, 'Pending', 'Vegas sounds fun!', '2024-03-21')
    `);

    // Update companions count for all trips
    db.run(`UPDATE Trips SET companionsCount = (
        SELECT COUNT(*) 
        FROM TripRequests 
        WHERE TripRequests.tripId = Trips.tripId 
        AND TripRequests.status = 'Approved'
    )`);

    console.log("Database initialized successfully with dummy data.");
});

db.close();
