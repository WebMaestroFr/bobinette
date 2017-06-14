const Camera = require('./camera');
const Vision = require('./vision');
const WebSocket = require('./websocket');
const Snapshot = require('./snapshot');

const cameraSocket = new WebSocket(9000);
const appSocket = new WebSocket(9001);

const camera = new Camera({width: 480, height: 360, framerate: 8});
camera.mjpeg((buffer) => {
    const date = new Date();
    cameraSocket.broadcast(buffer, `base64`);
    Vision.detect({
        cascade: `frontalface_default`,
        scale: 1.2,
        neighbors: 1,
        size: [48, 48]
    }, buffer, 2 / 3).then((detections) => {
        const snapshot = new Snapshot(date, detections);
        appSocket.broadcast({
            type: `snapshot`,
            data: snapshot
        }, `json`);
        console.error(`\x1b[32m✔ Snapshot\x1b[0m`, JSON.stringify(snapshot));
    }).catch(console.error);
});