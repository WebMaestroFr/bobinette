const spawn = require(`child_process`).spawn;
const WebSocket = require(`./websocket`);

const socket = new WebSocket(9000);

const execution = spawn(`python`, [`${__dirname}/snapshot.py`]);

execution
    .stdout
    .on(`data`, (data) => {
        const snapshot = JSON.parse(data);
        socket.broadcast({
            type: `snapshot`,
            data: snapshot
        }, `json`);
        return console.log(response);
    });
execution
    .stderr
    .on(`data`, (data) => {
        const response = data.toString();
        return console.error(response);
    });