const ws = require(`ws`);

class WebSocket {
    constructor(port) {
        this.server = new ws.Server({port: port, perMessageDeflate: false});
        console.error(`\x1b[32m✔\x1b[0m WebSocket Server`, port);
    }
    broadcast(message, encoding = null) {
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
            for (const client of this.server.clients) {
                if (client.readyState === ws.OPEN) {
                    client.send(message);
                }
            }
        } catch (err) {
            console.error(`\x1b[31m✘\x1b[0m WebSocket`, err);
        }
    }
}

module.exports = WebSocket;