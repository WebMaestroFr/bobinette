const path = require(`path`);

const Database = require(`./database`);
const API = require(`./api`);
const Vision = require(`./vision`);

const api = new API(9000);

Database
    .open(`faces`)
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
            `image TEXT`,
            `FOREIGN KEY(label) REFERENCES label(id)`
        ]);

        api
            .socket
            .on(`connection`, (client) => {
                console.error(`\x1b[32m✔\x1b[0m Socket Connection (${api.socket.clients.size})`);
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

        Vision.detect(`faces`, ({date, detections, image}) => {
            const logLabel = (detection) => `\x1b[1m${detection.label}\x1b[0m: ${detection.confidence * 100}%`;
            console.error(`\x1b[32m✔\x1b[0m Snapshot {${detections.map(logLabel).join(", ")}}`);

            const insertDetection = (detection) => {
                Object.assign(detection, {date});
                return db.insert(`detection`, detection);
            };

            for (const detection of detections) {
                if (detection.confidence === 1.0) {
                    db
                        .insert(`label`, {
                        id: detection.label,
                        name: ``
                    })
                        .then((label) => {
                            api.broadcast({type: `labels`, data: [label]});
                            insertDetection(detection);
                        });
                } else {
                    insertDetection(detection);
                }
            }

            api.broadcast({
                type: `snapshot`,
                data: {
                    date,
                    detections,
                    image
                }
            });
        });
    });