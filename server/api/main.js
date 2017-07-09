const express = require(`express`);
const ws = require(`ws`);

class API {
    constructor(port, staticDirectory) {
        const appStatic = express.static(staticDirectory);
        this.router = express();
        this
            .router
            .use(appStatic);

        this.server = require(`http`).createServer(this.router);
        this.socket = new ws.Server({server: this.server, perMessageDeflate: false});

        this
            .server
            .listen(port, () => {
                console.error(`\x1b[32m✔\x1b[0m API Server (port \x1b[1m${port}\x1b[0m)`);
            });
    }

    broadcast(message, encoding = null) {
        return new Promise((resolve) => {
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
                for (const client of this.socket.clients) {
                    if (client.readyState === ws.OPEN) {
                        client.send(message);
                    }
                }
                return resolve(message);
            } catch (err) {
                return console.error(`\x1b[31m✘\x1b[0m WebSocket`, err);
            }
        });
    }
}

module.exports = API;