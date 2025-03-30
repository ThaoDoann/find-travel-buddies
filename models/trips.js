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

// Get all trips
async function getAllTrips() {
    return await db.all("SELECT * FROM Trips");
}

// Get trips by user id
async function getTripById(tripId) {
    return await db.get("SELECT * FROM trips WHERE tripId = ?", [tripId]);
}


// Get trips by user id
async function getTripsByUserId(userId) {
    return await db.all("SELECT * FROM trips WHERE userId = ?", [userId]);
}

// Add a planned trip
async function addPlannedTrip(userId, tripName, tripTypeId, startDate, endDate, location, budget, description) {
    return await db.run("INSERT INTO trips (userId, tripName, tripTypeId, startDate, endDate, location, budget, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", 
        [userId, tripName, tripTypeId, startDate, endDate, location, budget, description]);
}


// Get all trip types
async function getAllTripTypes() {
    return await db.all("SELECT * FROM TripTypes");
}



// Get all trip requests by tripId
async function getTripRequestsById(tripId) {
    return await db.all("SELECT * FROM TripRequests WHERE tripId = ?", [tripId]);
}

async function getTripRequestsInfo(tripId) {
    return await db.all(`SELECT TripRequests.*, Users.*
        FROM TripRequests
        INNER JOIN Users ON TripRequests.userId = Users.userId
        WHERE TripRequests.tripId = ?`, [tripId]);
}

// Update companions count for a trip
async function updateTripCompanionsCount(tripId) {
    const result = await db.get(`
        SELECT COUNT(*) as count 
        FROM TripRequests 
        WHERE tripId = ? AND status = 'Approved'
    `, [tripId]);
    
    return await db.run(
        "UPDATE Trips SET companionsCount = ? WHERE tripId = ?",
        [result.count, tripId]
    );
}

// Update trip request status
async function updateTripRequestStatus(requestId, status) {
    // First get the tripId from the request
    const request = await db.get("SELECT tripId FROM TripRequests WHERE requestId = ?", [requestId]);
    
    // Update the request status
    await db.run("UPDATE TripRequests SET status = ? WHERE requestId = ?", [status, requestId]);
    
    // Update the companions count for the trip
    await updateTripCompanionsCount(request.tripId);
}

module.exports = {
    getAllTrips,
    getTripById,
    getTripsByUserId,
    addPlannedTrip,
    getAllTripTypes,
    getTripRequestsById,
    getTripRequestsInfo,
    updateTripRequestStatus,
    updateTripCompanionsCount,
};