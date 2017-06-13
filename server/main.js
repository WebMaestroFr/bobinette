const Camera = require(`./camera`);
const Vision = require(`./vision`);
const WebSocket = require(`./websocket`);

const cameraSocket = new WebSocket(9000);
const detectionSocket = new WebSocket(9001);

const handleFaceDetection = (faces) => {
    detectionSocket.broadcast({
        type: `detection`,
        data: faces
    }, `json`);
    console.error(`\x1b[32m✔\x1b[0m Frontal Faces`, faces);
};

const handleCameraFrame = (buffer) => {
    cameraSocket.broadcast(buffer, `base64`);
    Vision.detect({
        cascade: `frontalface_default`,
        scale: 1.2,
        neighbors: 2,
        size: [48, 48]
    }, buffer)
        .then(handleFaceDetection)
        .catch(console.error);
};

const camera = new Camera({width: 480, height: 360, framerate: 8});
camera.mjpeg(handleCameraFrame);