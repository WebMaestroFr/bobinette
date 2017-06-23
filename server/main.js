const spawn = require(`child_process`).spawn;
const WebSocket = require(`./websocket`);
const Snapshot = require(`./vision`).Snapshot;

const cameraSocket = new WebSocket(9000);
const appSocket = new WebSocket(9001);

const execution = spawn(`python`, [`${__dirname}/snapshot.py`], {
    stdio: [`pipe`, `pipe`, `pipe`]
});
console.error(`\x1b[34mVision Process\n=>\x1b[0m python`, args.join(` `));

execution
    .stdout
    .on(`data`, (data) => {
        const snapshot = JSON.parse(data);
        appSocket.broadcast({
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