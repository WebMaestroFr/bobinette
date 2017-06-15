const ws = require(`ws`);

class WebSocket {
    constructor(port) {
        this.server = new ws.Server({port: port, perMessageDeflate: false});
        console.error(`\x1b[32m✔ WebSocket Server\x1b[0m`, port);
    }
    broadcast(message, encoding = null) {
        return new Promise((resolve) => {
            switch (encoding) {
                case null:
                    break;
                case `json`:
                    message = JSON.stringify(message, null, '  ');
                    break;
                default:
                    message = message.toString(encoding);
            }
            try {
                for (const client of this.server.clients) {
                    if (client.readyState === ws.OPEN) {
                        client.send(message);
                    }
                }
                return resolve(message);
            } catch (err) {
                return console.error(`\x1b[31m✘\x1b[0m WebSocket Message`, err);
            }
        });
    }
}

module.exports = WebSocket;