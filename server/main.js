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

        const detectionDefinition = [`date INTEGER`, `label INTEGER`, `confidence REAL`, `image TEXT`, `FOREIGN KEY(label) REFERENCES label(id)`];
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
                    .then((labels) => api.sendAction(client, `SET_LABELS`, labels))
                    .catch(debug.error);
                database
                    .select(`detection`)
                    .then((detections) => api.sendAction(client, `SET_DETECTIONS`, detections))
                    .catch(debug.error);

                client.on(`message`, (message) => {
                    const {method, table, data} = JSON.parse(message);
                    debug.warning(`Client Action => \x1b[1m${method} ${table}\x1b[0m`);
                    return database[method](table, data).catch(debug.error);
                });
            });
        const vision = Vision.detect(`faces`, ({date, detections, image}) => {
            debug.success(`Snapshot ${date} (\x1b[1m${detections.length}\x1b[0m faces)`, detections.length);

            api
                .broadcastAction(`SET_SNAPSHOT`, {date, detections, image})
                .catch(debug.error);

            const insertDetection = ({label, confidence, image}) => database
                .insert(`detection`, {label, confidence, image, date})
                .then((d) => {
                    api.broadcastAction(`ADD_DETECTIONS`, [d]);
                })
                .catch(debug.error);

            for (const detection of detections) {

                if (detection.confidence === 1.0) {
                    debug.warning(`Label \x1b[1m${detection.label}\x1b[0m => NEW`);
                    database
                        .insert(`label`, {
                        id: detection.label,
                        name: ``
                    })
                        .then((label) => {
                            insertDetection(detection);
                            api
                                .broadcastAction(`ADD_LABELS`, [label])
                                .catch(debug.error);
                        })
                        .catch(debug.error);
                } else if (detection.confidence > 0) {
                    debug.warning(`Label \x1b[1m${detection.label}\x1b[0m => ${detection.confidence * 100}%`);
                    insertDetection(detection);
                }
            }
        });

        const terminate = () => {
            api.close();
            database.close();
            vision.kill(`SIGTERM`);
            debug.error(`Exit Process`);
        };
        process.on(`SIGTERM`, terminate);
        process.on(`SIGINT`, terminate);
    })
    .catch(debug.error);