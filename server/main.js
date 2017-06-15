const cpus = require(`os`).cpus();

const Camera = require(`./camera`);
const WebSocket = require(`./websocket`);
const Snapshot = require(`./snapshot`);

const cameraSocket = new WebSocket(9000);
const appSocket = new WebSocket(9001);

console.error(`\x1b[32m✔ CPU\x1b[0m`, cpus.length);

const camera = new Camera({width: 480, height: 360, framerate: 8});

let countProcess = cpus.length > 2
    ? cpus.length - 2
    : 1;

camera.mjpeg((buffer) => {
    cameraSocket.broadcast(buffer, `base64`);
    const snapshot = new Snapshot(buffer);
    if (0 === countProcess) {
        return null;
    }
    countProcess -= 1;
    return snapshot
        .setDetections({
        cascade: `frontalface_default`,
        scale: 1.2,
        neighbors: 2,
        size: [48, 48]
    })
        .then((detections) => {
            countProcess += 1;
            appSocket.broadcast({
                type: `detections`,
                data: detections
            }, `json`).then((message) => {
                return console.error(`\x1b[32m✔ Detection\x1b[0m (${detections.length})`);
            });
            if (0 === detections.length) {
                return null;
            }
            return snapshot.setFeatures({
                cascade: `eye`,
                scale: 1.1,
                neighbors: 2,
                size: [12, 12]
            }, {
                x: 1 / 4,
                y: 1 / 4
            }, {
                x: 3 / 4,
                y: 1 / 4
            }).then((results) => {
                snapshot.detections = results.filter(Boolean);
                appSocket.broadcast({
                    type: `snapshot`,
                    data: snapshot
                }, `json`).then((message) => {
                    return console.error(`\x1b[32m✔ Snapshot\x1b[0m (${snapshot.detections.length})`);
                });
            }).catch(console.error);
        });
});