const path = require('path');
const fs = require('fs');

const cpus = require(`os`).cpus();

const Camera = require(`./camera`);
const WebSocket = require(`./websocket`);
const Snapshot = require(`./vision`).Snapshot;

const cameraSocket = new WebSocket(9000);
const appSocket = new WebSocket(9001);

console.error(`\x1b[32m✔ CPU\x1b[0m`, cpus.length);

const camera = new Camera({width: 480, height: 360, framerate: 8});

const rootPath = path.resolve(__dirname, `../data`);
const modelPath = path.resolve(rootPath, `faces.xml`);

let ready = true;

camera.mjpeg((buffer) => {
    cameraSocket.broadcast(buffer, `base64`);
    if (!ready) {
        return null;
    }
    ready = false;
    const snapshot = new Snapshot(rootPath, buffer);
    return snapshot
        .setDetections({
        cascade: `frontalface_default`,
        scale: 1.1,
        neighbors: 2,
        size: [48, 48]
    })
        .then((detections) => {
            appSocket.broadcast({
                type: `detections`,
                data: detections
            }, `json`);
            console.error(`\x1b[32m✔ Detections\x1b[0m`, detections);
            return snapshot
                .setPredictions(modelPath)
                .then((predictions) => {
                    appSocket.broadcast({
                        type: `predictions`,
                        data: predictions
                    }, `json`);
                    console.error(`\x1b[32m✔ Predictions\x1b[0m`, predictions);
                    return snapshot.setObjects({
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
                    }).then((objects) => {
                        appSocket.broadcast({
                            type: `objects`,
                            data: objects
                        }, `json`);
                        if (objects.length) {
                            console.error(`\x1b[32m✔ Objects\x1b[0m`, objects);
                        } else {
                            fs.unlinkSync(snapshot.image);
                        }
                        ready = true;
                    }).catch(console.error);
                })
                .catch(console.error);
        })
        .catch(console.error);
});