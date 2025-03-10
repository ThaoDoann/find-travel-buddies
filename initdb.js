const sqlite3 = require("sqlite3").verbose();

// Connect to the database (creates "database.db" if it doesn't exist)
const db = new sqlite3.Database("database.db");

db.serialize(function () {
  console.log("Initializing database...");

  // Drop existing tables (for testing purposes)
  db.run("DROP TABLE IF EXISTS Users");
  db.run("DROP TABLE IF EXISTS Trips");
  db.run("DROP TABLE IF EXISTS Connections");
  db.run("DROP TABLE IF EXISTS Chat");
  db.run("DROP TABLE IF EXISTS Payments");

  // Create Users table
  db.run(`
    CREATE TABLE Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      phone_number TEXT DEFAULT NULL,
      address TEXT DEFAULT NULL,
      bio TEXT DEFAULT NULL,
      profile_pic BLOB DEFAULT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_by INTEGER DEFAULT NULL,
      is_active INTEGER DEFAULT 1
    )
  `);

  // Insert sample users
  db.run("INSERT INTO Users (name, email, password, phone_number, address, bio) VALUES (?, ?, ?, ?, ?, ?)", [
    "Alice Smith",
    "alice@example.com",
    "password123",
    "+1-555-1234",
    "123 Maple St, Toronto, ON",
    "Adventure lover, food explorer.",
  ]);
  db.run("INSERT INTO Users (name, email, password, phone_number, address, bio) VALUES (?, ?, ?, ?, ?, ?)", [
    "Bob Johnson",
    "bob@example.com",
    "securepass",
    "+1-555-5678",
    "456 Oak St, Vancouver, BC",
    "Tech enthusiast and traveler.",
  ]);

  // Create Trips table
  db.run(`
    CREATE TABLE Trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      destination TEXT NOT NULL,
      address TEXT DEFAULT NULL,
      travel_start_date INTEGER NOT NULL,
      travel_end_date INTEGER NOT NULL,
      budget REAL NOT NULL,
      travel_style TEXT DEFAULT NULL,
      description TEXT DEFAULT NULL,
      trip_image BLOB DEFAULT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_by INTEGER DEFAULT NULL,
      is_default INTEGER DEFAULT 0,
      FOREIGN KEY(user_id) REFERENCES Users(id) ON DELETE CASCADE
    )
  `);

  // Insert sample trips
  db.run("INSERT INTO Trips (user_id, destination, address, travel_start_date, travel_end_date, budget, travel_style, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
    1,
    "Paris, France",
    "Eiffel Tower, 75007 Paris, France",
    1728000000, 
    1732000000,
    1500.0,
    "Backpacking",
    "Exploring the beauty of Paris, visiting the Louvre and Notre-Dame.",
  ]);
  db.run("INSERT INTO Trips (user_id, destination, address, travel_start_date, travel_end_date, budget, travel_style, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
    2,
    "Tokyo, Japan",
    "Shibuya, Tokyo, Japan",
    1740000000,
    1745000000,
    2000.0,
    "Luxury",
    "Experience Tokyo’s culture, food, and tech innovations.",
  ]);

  // Create Connections table
  db.run(`
    CREATE TABLE Connections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      requester_id INTEGER NOT NULL,
      recipient_id INTEGER NOT NULL,
      status TEXT DEFAULT 'Pending',
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_by INTEGER DEFAULT NULL,
      FOREIGN KEY(requester_id) REFERENCES Users(id) ON DELETE CASCADE,
      FOREIGN KEY(recipient_id) REFERENCES Users(id) ON DELETE CASCADE
    )
  `);

  // Insert sample connections
  db.run("INSERT INTO Connections (requester_id, recipient_id, status) VALUES (?, ?, ?)", [1, 2, "Accepted"]);
  db.run("INSERT INTO Connections (requester_id, recipient_id, status) VALUES (?, ?, ?)", [2, 1, "Pending"]);

  // Create Chat table
  db.run(`
    CREATE TABLE Chat (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      recipient_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      sent_at INTEGER DEFAULT (strftime('%s', 'now')),
      is_read INTEGER DEFAULT 0,
      FOREIGN KEY(sender_id) REFERENCES Users(id) ON DELETE CASCADE,
      FOREIGN KEY(recipient_id) REFERENCES Users(id) ON DELETE CASCADE
    )
  `);

  // Insert sample chat messages
  db.run("INSERT INTO Chat (sender_id, recipient_id, message) VALUES (?, ?, ?)", [1, 2, "Hey Bob, excited for the trip?"]);
  db.run("INSERT INTO Chat (sender_id, recipient_id, message) VALUES (?, ?, ?)", [2, 1, "Yes, can't wait to visit Tokyo!"]);
  db.run("INSERT INTO Chat (sender_id, recipient_id, message) VALUES (?, ?, ?)", [1, 2, "I found a great hotel in Shibuya."]);
  db.run("INSERT INTO Chat (sender_id, recipient_id, message) VALUES (?, ?, ?)", [2, 1, "Awesome! Let’s book it."]);

  console.log("Database initialized successfully.");
});

db.close();
