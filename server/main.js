const path = require(`path`);

const Database = require(`./database`);
const API = require(`./api`);
const Vision = require(`./vision`);

const debug = require(`./debug`);

const build = path.resolve(__dirname, `../client/build`);
const api = new API(build);

api
    .server
    .listen(80, () => {
        debug.success(`API Server (port \x1b[1m80\x1b[0m)`);
    });

Database
    .open(`faces`)
    .then((db) => {
        debug.success(`Database \x1b[1mfaces\x1b[0m`);

        db
            .createTable(`label`, [`id INTEGER PRIMARY KEY`, `name TEXT`])
            .then(debug.warning)
            .catch(debug.error);
        db
            .createTable(`detection`, [
            `date INTEGER`,
            `x INTEGER`,
            `y INTEGER`,
            `width INTEGER`,
            `height INTEGER`,
            `label INTEGER`,
            `confidence REAL`,
            `image TEXT`,
            `FOREIGN KEY(label) REFERENCES label(id)`
        ])
            .then(debug.warning)
            .catch(debug.error);

        api
            .socket
            .on(`connection`, (client) => {
                debug.warning(`Socket Connection (${api.socket.clients.size})`);
                db
                    .select(`label`)
                    .then((labels) => {
                        const message = JSON.stringify({type: `labels`, data: labels});
                        client.send(message);
                    })
                    .catch(debug.error);
                db
                    .select(`detection`)
                    .then((detections) => {
                        const message = JSON.stringify({type: `detections`, data: detections});
                        client.send(message);
                    })
                    .catch(debug.error);

                client.on(`message`, (data) => {
                    const message = JSON.parse(data);
                    debug.warning(`Client Update \x1b[1m${message.type}\x1b[0m`);
                    return db
                        .update(message.type, message.data)
                        .catch(debug.error);
                });
            });

        Vision.detect(`faces`, ({date, detections, image}) => {
            debug.success(`Snapshot ${date}`);

            const insertDetection = (detection) => {
                Object.assign(detection, {date});
                return db
                    .insert(`detection`, detection)
                    .catch(debug.error);
            };

            for (const detection of detections) {
                debug.warning(`\x1b[1m${detection.label}\x1b[0m => ${detection.confidence * 100}%`);

                if (detection.confidence === 1.0) {
                    db
                        .insert(`label`, {
                        id: detection.label,
                        name: ``
                    })
                        .then((label) => {
                            api
                                .broadcast({type: `labels`, data: [label]})
                                .catch(debug.error);
                            insertDetection(detection);
                        })
                        .catch(debug.error);
                } else {
                    insertDetection(detection);
                }
            }

            api
                .broadcast({
                type: `snapshot`,
                data: {
                    date,
                    detections,
                    image
                }
            })
                .catch(debug.error);
        });
    })
    .catch(debug.error);