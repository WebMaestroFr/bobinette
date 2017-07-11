const express = require(`express`);
const path = require(`path`);
const ws = require(`ws`);

class API {
    constructor(build) {
        const buildStatic = express.static(build);
        this.router = express();
        this
            .router
            .use(buildStatic);
        this
            .router
            .get('/', function(req, res) {
                res.sendFile(path.join(build, 'index.html'));
            });
        this.server = require(`http`).createServer(this.router);
        this.socket = new ws.Server({server: this.server, perMessageDeflate: false});
    }

    broadcast(message, encoding = `json`) {
        return new Promise((resolve, reject) => {
            switch (encoding) {
                case null:
                    break;
                case `json`:
                    message = JSON.stringify(message);
                    break;
                default:
                    message = message.toString(encoding);
            }
            try {
                for (let client of this.socket.clients) {
                    if (client.readyState === ws.OPEN) {
                        client.send(message);
                    }
                }
                return resolve(message);
            } catch (err) {
                return reject(err);
            }
        });
    }
}

module.exports = API;