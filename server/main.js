const path = require(`path`);
const spawn = require(`child_process`).spawn;

const Database = require(`./database`);
const WebSocket = require(`./websocket`);
const API = require(`./api`);
const Snapshot = require(`./snapshot`);

const staticDirectory = path.resolve(__dirname, `../static`);

Database
    .open(`snapshot`)
    .then((db) => {

        db.createTable(`label`, [`id INTEGER PRIMARY KEY`, `name TEXT`]);
        db.createTable(`detection`, [
            `date INTEGER`,
            `x INTEGER`,
            `y INTEGER`,
            `width INTEGER`,
            `height INTEGER`,
            `label INTEGER`,
            `confidence REAL`,
            `FOREIGN KEY(label) REFERENCES label(id)`
        ]);

        const api = new API(8001, staticDirectory);
        const socket = new WebSocket(api.server);

        socket
            .server
            .on(`connection`, function connection(client) {
                console.error(`Socket Connection`);
                db
                    .select(`label`)
                    .then((labels) => {
                        const message = JSON.stringify({type: `labels`, data: labels});
                        client.send(message);
                    });
                db
                    .select(`detection`)
                    .then((detections) => {
                        const message = JSON.stringify({type: `detections`, data: detections});
                        client.send(message);
                    });
            });

        api
            .router
            .get(`/label`, (req, res) => {
                return db
                    .select(`label`)
                    .then((labels) => {
                        return res.json(labels);
                    });
            });

        api
            .router
            .get(`/detection`, (req, res) => {
                return db
                    .select(`detection`)
                    .then((detections) => {
                        return res.json(detections);
                    })
                    .catch(console.error);
            });

        const execution = spawn(`python`, [`${__dirname}/snapshot.py`]);

        const handleSnapshot = ({date, image, detections}) => {
            socket.broadcast({
                type: `snapshot`,
                data: {
                    date,
                    image,
                    detections
                }
            }, `json`);

            if (detections.length) {
                const snapshot = new Snapshot(date);
                snapshot.write(staticDirectory, image);

                for (detection of detections) {
                    console.error(`\x1b[1m${detection.label}\x1b[0m => ${detection.confidence}`);
                    if (detection.confidence === 1.0) {
                        db.insert(`label`, {
                            id: detection.label,
                            name: `Label #${detection.label}`
                        });
                    }
                    db.insert(`detection`, Object.assign({
                        date: snapshot.date
                    }, detection));
                }
            }
        };

        const processStdout = (data) => {
            const results = data.split(/}\s*{/);
            const subject = results.length === 1
                ? results[0]
                : `${results[0]}}`;
            try {
                const snapshot = JSON.parse(subject);
                handleSnapshot(snapshot);
            } catch (e) {
                if (e instanceof SyntaxError && results.length === 1) {
                    console.error(`\x1b[33m✘\x1b[0m Buffering ...`);
                    return data;
                } else {
                    console.error(e, subject);
                }
            } finally {
                return (results.length === 1)
                    ? ``
                    : processStdout(`{${results[1]}`);
            }
        };

        let stdout = ``;
        execution
            .stdout
            .on(`data`, (data) => {
                stdout = processStdout(stdout + data.toString());
            });

        execution
            .stderr
            .on(`data`, (data) => {
                const response = data.toString();
                return console.error(response);
            });
    });