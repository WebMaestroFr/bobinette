const spawn = require(`child_process`).spawn;
const WebSocket = require(`./websocket`);

const socket = new WebSocket(9000);

const execution = spawn(`python`, [`${__dirname}/snapshot.py`]);

const logSnapshot = (snapshot) => {
    console.error(`\x1b[32m✔\x1b[0m ${snapshot.date} => {`, snapshot.detections.map((detection) => {
        const label = `\x1b[1m${detection.label}: `;
        if (detection.confidence === 1.0) {
            return label + `\x1b[31mNEW\x1b[0m`;
        } else if (detection.confidence > 0.67) {
            return label + `\x1b[32m${detection.confidence * 100}%\x1b[0m`;
        } else {
            return label + `\x1b[33m${detection.confidence * 100}%\x1b[0m`;
        }
    }).join(", "), `}`);
};

let stdout = "";

execution
    .stdout
    .on(`data`, (data) => {
        try {
            stdout += data.toString();
            const snapshot = JSON.parse(stdout);
            stdout = ``;
            for (const detection of snapshot.detections) {
                if (detection.confidence === 1.0) {
                    socket.broadcast({
                        type: `label`,
                        data: Object.assign({
                            snapshot: snapshot
                        }, detection)
                    }, `json`);
                }
            }
            return socket.broadcast({
                type: `snapshot`,
                data: snapshot
            }, `json`).then(() => {
                logSnapshot(snapshot);
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
