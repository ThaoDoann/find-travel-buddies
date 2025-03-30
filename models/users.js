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

// Get User by id
async function getUserById(userId) {
    return await db.get("SELECT * FROM Users WHERE userId = ?", [userId]);
}

// Get user by email
async function getUserByEmail(email) {
    return await db.get("SELECT * FROM Users WHERE email = ?", [email]);
}

// Register a new user
async function createUser(userName, email, password, address, bio) {
    return await db.run("INSERT INTO Users (userName, email, password, address, bio) VALUES (?, ?, ?, ?, ?)", [userName, email, password, address, bio]);
}


// Update user information 
async function updateUser(userId, userName, email, password, address, bio, avatarBuffer) {
    // If avatar is provided, update it in the database
    if (avatarBuffer) {
        const result = await db.query('UPDATE users SET userName = ?, email = ?, address = ?, bio = ?, avatar = ? WHERE userId = ?',
            [userName, email, password, address, bio, avatarBuffer, userId]);
    } else {
        // If no avatar is uploaded, update the rest of the information
        const result = await db.query('UPDATE users SET userName = ?, email = ?, address = ?, bio = ? WHERE userId = ?',
            [userName, email, password, address, bio, userId]);
    }

    // Return the updated user with the new avatar (in memory or previous avatar)
    return getUserById(userId);
}


// // Update the user's avatar
// async function updateAvatar(userId, avatarBuffer) {
//     let result = await db.run("UPDATE users SET avatar = ? WHERE userId = ?", [avatarBuffer, userId]);
//     return result;
// }

// // Update the user's address
// async function updateAddress(userId, address) {
//     let result = await db.run("UPDATE users SET address = ? WHERE userId = ?", [address, userId]);
//     return result;
// }

module.exports = {
    getAllUsers,
    authenticateUser,
    getUserById,
    getUserByEmail,
    createUser,
    updateUser
    // updateAvatar,
    // updateAddress
};
