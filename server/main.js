const path = require(`path`);

const Database = require(`./database`);
const API = require(`./api`);
const Vision = require(`./vision`);

const staticDirectory = path.resolve(__dirname, `../static`);
const api = new API(9000, staticDirectory);

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
            `FOREIGN KEY(label) REFERENCES label(id)`
        ]);

        const extendLabel = (label) => {
            return db
                .select(`detection`, `WHERE label = ${label.id}`)
                .then((detections) => {
                    return Object.assign(label, {detections: detections});
                });
        };

        api
            .socket
            .on(`connection`, (client) => {
                console.error(`\x1b[32m✔\x1b[0m Socket Connection (${api.socket.clients.size})`);
                db
                    .select(`label`)
                    .then((labels) => {
                        Promise
                            .all(labels.map(extendLabel))
                            .then((labels) => {
                                const message = JSON.stringify({type: `labels`, data: labels});
                                client.send(message);
                            });
                    });
            });

        api
            .router
            .get(`/label/:id`, function(req, res) {
                db
                    .get(`label`, `WHERE id = ${req.params.id}`)
                    .then(extendLabel)
                    .then(res.json);
            });

        Vision.detect(`faces`, ({snapshot, detections, image}) => {

            if (detections.length) {
                snapshot.write(staticDirectory, image);
                console.error(`\x1b[32m✔\x1b[0m Snapshot \x1b[1m${snapshot.image}\x1b[0m`);

                for (let detection of detections) {
                    console.error(`\x1b[1m${detection.label}\x1b[0m => ${detection.confidence * 100}%`);

                    if (detection.confidence === 1.0) {
                        db
                            .insert(`label`, {
                            id: detection.label,
                            name: ``
                        })
                            .then(extendLabel)
                            .then((label) => {
                                api.broadcast({
                                    type: `labels`,
                                    data: [label]
                                }, `json`);
                            });
                    }

                    db.insert(`detection`, Object.assign(detection, {
                        date: snapshot
                            .date
                            .valueOf()
                    }));
                }
            }

            api.broadcast({
                type: `snapshot`,
                data: {
                    date: snapshot
                        .date
                        .valueOf(),
                    detections: detections,
                    image: image
                }
            }, `json`);
        });
    });