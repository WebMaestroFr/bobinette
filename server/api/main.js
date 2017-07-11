const express = require(`express`);
const ws = require(`ws`);

class API {
    constructor(port) {
        this.router = express();
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