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

// Get user by id with connection status
async function getUserById(userId) {
    const user = await db.get(`
        SELECT u.*, 
            CASE 
                WHEN c.status IS NULL THEN 'Not Connected'
                ELSE c.status
            END as connectionStatus
        FROM Users u
        LEFT JOIN Connections c ON 
            (c.requester_id = ? AND c.recipient_id = u.userId) OR
            (c.requester_id = u.userId AND c.recipient_id = ?)
        WHERE u.userId = ?
    `, [currentUserId, currentUserId, userId]);

    if (user) {
        user.canConnect = user.connectionStatus === 'Not Connected';
    }

    return user;
}

// Search users
async function searchUsers(query) {
    return await db.all(`
        SELECT userId, userName, email, address, avatar, bio
        FROM Users
        WHERE userName LIKE ? OR email LIKE ? OR address LIKE ? OR bio LIKE ?
        ORDER BY userName ASC
    `, [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]);
}

// // Get user by id with connection status
// async function getUserByIdWithConnection(userId, currentUserId) {
//     const user = await db.get(`
//         SELECT u.*, 
//             CASE 
//                 WHEN c.status IS NULL THEN 'Not Connected'
//                 ELSE c.status
//             END as connectionStatus
//         FROM Users u
//         LEFT JOIN Connections c ON 
//             (c.requester_id = ? AND c.recipient_id = u.userId) OR
//             (c.requester_id = u.userId AND c.recipient_id = ?)
//         WHERE u.userId = ?
//     `, [currentUserId, currentUserId, userId]);

//     if (user) {
//         user.canConnect = user.connectionStatus === 'Not Connected';
//     }

//     return user;
// }

// Create connection request
async function createConnectionRequest(requesterId, recipientId) {
    return await db.run(`
        INSERT INTO Connections (requester_id, recipient_id, status)
        VALUES (?, ?, 'Pending')
    `, [requesterId, recipientId]);
}

// Update connection status
async function updateConnectionStatus(connectionId, status) {
    return await db.run(`
        UPDATE Connections 
        SET status = ? 
        WHERE id = ?
    `, [status, connectionId]);
}

// Get user's connections
async function getUserConnections(userId) {
    return await db.all(`
        SELECT u.*, c.status as connectionStatus, c.id as connectionId
        FROM Users u
        JOIN Connections c ON 
            (c.requester_id = ? AND c.recipient_id = u.userId) OR
            (c.requester_id = u.userId AND c.recipient_id = ?)
        WHERE c.status = 'Accepted'
        ORDER BY u.userName ASC
    `, [userId, userId]);
}

// Get pending connection requests
async function getPendingConnectionRequests(userId) {
    return await db.all(`
        SELECT u.*, c.id as connectionId
        FROM Users u
        JOIN Connections c ON c.requester_id = u.userId
        WHERE c.recipient_id = ? AND c.status = 'Pending'
        ORDER BY c.created_at DESC
    `, [userId]);
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
    return await db.run("INSERT INTO Users (userName, email, password, address, bio) VALUES (?, ?, ?, ?, ?)", 
        [userName, email, password, address, bio]);
}

// Update user information 
async function updateUser(userId, userName, email, password, address, bio, avatarBuffer) {
    if (avatarBuffer) {
        return await db.run(`
            UPDATE users 
            SET userName = ?, email = ?, address = ?, bio = ?, avatar = ? 
            WHERE userId = ?
        `, [userName, email, password, address, bio, avatarBuffer, userId]);
    } else {
        return await db.run(`
            UPDATE users 
            SET userName = ?, email = ?, address = ?, bio = ? 
            WHERE userId = ?
        `, [userName, email, password, address, bio, userId]);
    }
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
    searchUsers,
    createConnectionRequest,
    updateConnectionStatus,
    getUserConnections,
    getPendingConnectionRequests,
    authenticateUser,
    getUserById,
    getUserByEmail,
    createUser,
    updateUser
    // updateAvatar,
    // updateAddress
};
