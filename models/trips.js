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

// Get all trips by user ID, sorted by status and date
async function getTripsByUserId(userId) {
    return await db.all(`
        SELECT t.*, tt.*
        FROM Trips t
        JOIN TripTypes tt ON t.tripTypeId = tt.id
        WHERE t.userId = ?
        ORDER BY 
            CASE t.status
                WHEN 'Planned' THEN 1
                WHEN 'Completed' THEN 2
                WHEN 'Canceled' THEN 3
                ELSE 4
            END,
            t.startDate ASC
    `, [userId]);
}

// Get all public trips
async function getPublicTrips() {
    return await db.all(`
        SELECT t.*, tt.name as tripType, u.userName as ownerName,
            CASE 
                WHEN t.status = 'Planned' AND t.startDate >= date('now') THEN 1
                WHEN t.status = 'Completed' THEN 2
                WHEN t.status = 'Canceled' THEN 3
                ELSE 4
            END as sortOrder
        FROM Trips t
        JOIN TripTypes tt ON t.tripTypeId = tt.id
        JOIN Users u ON t.userId = u.userId
        WHERE t.isPublic = 1
        ORDER BY sortOrder, t.startDate ASC
    `);
}

// Search trips with filters
async function searchTrips(query, tripType, location) {
    let sql = `
        SELECT t.*, tt.name as tripType, u.userName as ownerName 
        FROM Trips t
        JOIN TripTypes tt ON t.tripTypeId = tt.id
        JOIN Users u ON t.userId = u.userId
        WHERE t.isPublic = 1`;
    const params = [];

    if (query) {
        sql += ` AND (t.tripName LIKE ? OR t.location LIKE ? OR t.description LIKE ?)`;
        params.push(`%${query}%`, `%${query}%`, `%${query}%`);
    }

    if (tripType) {
        sql += ` AND t.tripTypeId = ?`;
        params.push(tripType);
    }

    if (location) {
        sql += ` AND t.location LIKE ?`;
        params.push(`%${location}%`);
    }

    sql += ` ORDER BY t.startDate ASC`;

    return await db.all(sql, params);
}

// Get public trips by user ID
async function getPublicTripsByUserId(userId) {
    return await db.all(`
        SELECT t.*, tt.name 
        FROM Trips t JOIN TripTypes tt ON t.tripTypeId = tt.id
        WHERE t.userId = ? AND t.isPublic = 1
        ORDER BY 
            CASE t.status
                WHEN 'Planned' THEN 1
                WHEN 'Completed' THEN 2
                WHEN 'Canceled' THEN 3
                ELSE 4
            END,
            t.startDate ASC
    `, [userId]);
}

// Get public trips by user ID
async function getTripsByUserId(userId) {
    return await db.all(`
        SELECT t.*, tt.* FROM Trips t
        JOIN TripTypes tt ON t.tripTypeId = tt.id
        WHERE t.userId = ?
        ORDER BY 
            CASE t.status
                WHEN 'Planned' THEN 1
                WHEN 'Completed' THEN 2
                WHEN 'Canceled' THEN 3
                ELSE 4
            END,
            t.startDate ASC
    `, [userId]);
}


// Create a new trip
async function addPlannedTrip(userId, tripName, tripTypeId, startDate, endDate, location, budget, description, maxCompanions, isPublic) {
    return await db.run(`
        INSERT INTO Trips (userId, tripName, tripTypeId, startDate, endDate, location, budget, description, maxCompanions, isPublic)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [userId, tripName, tripTypeId, startDate, endDate, location, budget, description, maxCompanions, isPublic]);
}

// Get trip by ID with owner info
async function getTripById(tripId) {
    return await db.get(`
        SELECT t.*, tt.name as tripType, u.userName as ownerName, u.userId
        FROM Trips t
        JOIN TripTypes tt ON t.tripTypeId = tt.id
        JOIN Users u ON t.userId = u.userId
        WHERE t.tripId = ?
    `, [tripId]);
}

// Get trip requests with user info
async function getTripRequestsInfo(tripId) {
    return await db.all(`
        SELECT 
            tr.requestId,
            tr.status,
            tr.userId,
            u.userName,
            u.avatar
        FROM TripRequests tr
        JOIN Users u ON tr.userId = u.userId
        WHERE tr.tripId = ?
        ORDER BY tr.requestDate DESC
    `, [tripId]);
}

// Update trip request status
async function updateTripRequestStatus(requestId, status) {
    return await db.run(`
        UPDATE TripRequests 
        SET status = ? 
        WHERE requestId = ?
    `, [status, requestId]);
}

// Update companions count for a trip
async function updateCompanionsCount(tripId) {
    return await db.run(`
        UPDATE Trips 
        SET companionsCount = (
            SELECT COUNT(*) 
            FROM TripRequests 
            WHERE tripId = ? 
            AND status = 'Approved'
        )
        WHERE tripId = ?
    `, [tripId, tripId]);
}

// Get all trip types
async function getAllTripTypes() {
    return await db.all("SELECT * FROM TripTypes ORDER BY name");
}

// Update trip details
async function updateTrip(tripId, tripName, location, startDate, endDate, budget, maxCompanions, description, isPublic) {
    return await db.run(`
        UPDATE Trips 
        SET tripName = ?,
            location = ?,
            startDate = ?,
            endDate = ?,
            budget = ?,
            maxCompanions = ?,
            description = ?,
            isPublic = ?
        WHERE tripId = ?
    `, [tripName, location, startDate, endDate, budget, maxCompanions, description, isPublic, tripId]);
}

// Get trip request
async function getTripRequest(tripId, userId) {
    return await db.get(`
        SELECT * FROM TripRequests 
        WHERE tripId = ? AND userId = ?
    `, [tripId, userId]);
}


// Get user's sent trip requests
async function getUserTripRequests(userId) {
    // return await db.all(`
    //     SELECT tr.*, t.*, u.userName, 
    //            tr.message as requestMessage,
    //            tr.requestDate
    //     FROM TripRequests tr
    //     JOIN Trips t ON tr.tripId = t.tripId
    //     JOIN Users u ON t.userId = u.userId
    //     WHERE tr.userId = ?
    //     ORDER BY tr.requestDate DESC
    // `, [userId]);

    return await db.all(`
        SELECT tr.*, t.tripName, t.location, t.startDate, t.endDate, t.budget, t.maxCompanions, u.userName, 
               tr.message as requestMessage,
               tr.requestDate
        FROM TripRequests tr
        JOIN Trips t ON tr.tripId = t.tripId
        JOIN Users u ON t.userId = u.userId
        WHERE tr.userId = ?
        ORDER BY tr.requestDate DESC
    `, [userId]);
}

// Cancel trip request
async function cancelTripRequest(requestId, userId) {
    return await db.run(`
        DELETE FROM TripRequests 
        WHERE requestId = ? AND userId = ? AND status = 'Pending'
    `, [requestId, userId]);
}

// Create trip request
async function createTripRequest(userId, tripId, message) {
    return await db.run(`
        INSERT INTO TripRequests (userId, tripId, status, message)
        VALUES (?, ?, 'Pending', ?)
    `, [userId, tripId, message]);
}

module.exports = {
    getTripsByUserId,
    getPublicTrips,
    searchTrips,
    getPublicTripsByUserId,
    addPlannedTrip,
    getTripById,
    getTripRequestsInfo,
    updateTripRequestStatus,
    updateCompanionsCount,
    getAllTripTypes,
    updateTrip,
    getTripRequest,
    createTripRequest,
    getUserTripRequests,
    cancelTripRequest
};