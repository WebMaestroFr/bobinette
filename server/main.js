const spawn = require(`child_process`).spawn;
const WebSocket = require(`./websocket`);

const socket = new WebSocket(9000);

const execution = spawn(`python`, [`${__dirname}/snapshot.py`]);

let stdout = "";

execution
    .stdout
    .on(`data`, (data) => {
        try {
            stdout += data.toString();
            const snapshot = JSON.parse(stdout);
            stdout = "";
            return socket.broadcast({
                type: `snapshot`,
                data: snapshot
            }, `json`).then(() => {
                return console.error(`\x1b[32m✔\x1b[0m ${snapshot.date} / \x1b[1m${snapshot.detections.length} faces\x1b[0m`);
            });
        } catch (e) {
            return console.error(`\x1b[31m✘\x1b[0m Buffering ...`);
        }
    });
execution
    .stderr
    .on(`data`, (data) => {
        const response = data.toString();
        return console.error(response);
    });