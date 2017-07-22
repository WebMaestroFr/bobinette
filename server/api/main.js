const express = require(`express`);
const path = require(`path`);
const ws = require(`ws`);

class API {
    constructor(application) {
        const staticApplication = express.static(application);
        this.router = express();
        this
            .router
            .use(staticApplication);
        this
            .router
            .get('/', function(req, res) {
                res.sendFile(path.join(application, 'index.html'));
            });
        this.server = require(`http`).createServer(this.router);
        this.socket = new ws.Server({server: this.server, perMessageDeflate: false});
    }

    close() {
        this
            .server
            .close();
        this
            .socket
            .close();
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