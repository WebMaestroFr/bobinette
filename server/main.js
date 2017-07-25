const path = require(`path`);

const Database = require(`./database`);
const API = require(`./api`);
const Vision = require(`./vision`);

const debug = require(`./debug`);

const application = path.resolve(__dirname, `../client/build`);
const api = new API(application);

api
    .server
    .listen(8000, () => {
        debug.success(`API Server (port \x1b[1m8000\x1b[0m)`);
    });

Database
    .open(`faces`)
    .then((database) => {
        debug.success(`Database \x1b[1mfaces\x1b[0m`);

        const labelDefinition = [`id INTEGER PRIMARY KEY`, `name TEXT`];
        database
            .createTable(`label`, labelDefinition)
            .then(debug.warning)
            .catch(debug.error);

        const detectionDefinition = [
            `date INTEGER`,
            `x INTEGER`,
            `y INTEGER`,
            `width INTEGER`,
            `height INTEGER`,
            `label INTEGER`,
            `confidence REAL`,
            `image TEXT`,
            `features TEXT`,
            `FOREIGN KEY(label) REFERENCES label(id)`
        ];
        database
            .createTable(`detection`, detectionDefinition)
            .then(debug.warning)
            .catch(debug.error);

        api
            .socket
            .on(`connection`, (client) => {
                debug.warning(`Socket Connection (${api.socket.clients.size})`);
                database
                    .select(`label`)
                    .then((labels) => {
                        const message = JSON.stringify({type: `labels`, data: labels});
                        client.send(message);
                    })
                    .catch(debug.error);
                database
                    .select(`detection`)
                    .then((detections) => {
                        const message = JSON.stringify({type: `detections`, data: detections});
                        client.send(message);
                    })
                    .catch(debug.error);

                client.on(`message`, (message) => {
                    const {type, data} = JSON.parse(message);
                    debug.warning(`Client Update \x1b[1m${type}\x1b[0m`);
                    return database
                        .update(type, data)
                        .catch(debug.error);
                });
            });

        const detection = Vision.detect(`faces`, ({date, detections, image}) => {
            debug.success(`Snapshot ${date}`);

            const insertDetection = (detection) => {
                Object.assign(detection, {date});
                return database
                    .insert(`detection`, detection)
                    .catch(debug.error);
            };

            for (const detection of detections) {
                debug.warning(`\x1b[1m${detection.label}\x1b[0m => ${detection.confidence * 100}% (${detection.features.length}/2)`);

                if (detection.confidence === 1.0) {
                    database
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
                } else if (detection.features.length === 2) {
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

        const terminate = () => {
            api.close();
            database.close();
            detection.kill(`SIGTERM`);
            debug.error(`Exit Process`);
        };
        process.on(`SIGTERM`, terminate);
        process.on(`SIGINT`, terminate);
    })
    .catch(debug.error);