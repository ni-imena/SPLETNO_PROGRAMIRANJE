const WebSocket = require("ws");
var SetRunModel = require("../models/setRunModel.js");

function setupWebSocketServer(server) {
    const wss = new WebSocket.Server({ server });

    wss.on("connection", function connection(ws) {
        console.log("A client connected.");

        ws.on("message", async function incoming(message) {
            const location = JSON.parse(message);

            const coords = [location.latitude, location.longitude];
            try {
                const runs = await nearbySetRuns(coords);
                ws.send(JSON.stringify(runs));
            } catch (error) {
                console.error("Error retrieving nearby set runs:", error);
            }
        });

        ws.on("close", function close() {
            console.log("A client disconnected.");
        });
    });
}

const nearbySetRuns = (coords) => {

    return new Promise((resolve, reject) => {
        SetRunModel.find(
            function (err, runs) {
                if (err) { reject(err); }
                const runsWithDistanceFromUser = runs.map((run) => {
                    const distanceFromUser = getDistance(coords[0], coords[1], run.location.coordinates[0], run.location.coordinates[1]);
                    return { ...run.toObject(), distanceFromUser };
                });
                resolve(runsWithDistanceFromUser);
            }
        );
    });
};


const getDistance = (lat1, lng1, lat2, lng2) => {
    if (lat1 === lat2 && lng1 === lng2) {
        return 0;
    }

    const deg2rad = (deg) => {
        return deg * (Math.PI / 180);
    };

    const R = 6371; // Radius of the Earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLng = deg2rad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
};

module.exports = setupWebSocketServer;
