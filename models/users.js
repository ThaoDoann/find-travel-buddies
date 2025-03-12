const sqlite3 = require("sqlite3").verbose();
const sqlite = require("sqlite");

async function init() {
    try {
        db = await sqlite.open({
            filename: 'database.db',
            driver: sqlite3.Database
        });
    } catch (err) {
        console.error(err);
    }
}

init();

// Get all users
async function getAllUsers() {
    return await db.all("SELECT * FROM Users");
}

// Authenticate user (login)
async function authenticateUser(email, password) {
    return await db.all("SELECT * FROM Users WHERE UPPER(email) = UPPER(?) AND password = ?", [email, password]);
}

// Get user by username
async function getUserByEmail(email) {
    return await db.get("SELECT * FROM Users WHERE email = ?", [email]);
}

// Register a new user
async function createUser(name, email, password, bio) {
    return await db.run("INSERT INTO Users (name, email, password, bio) VALUES (?, ?, ?, ?)", [name, email, password, bio]);
}

module.exports = {
    getAllUsers,
    authenticateUser,
    getUserByEmail,
    createUser
};