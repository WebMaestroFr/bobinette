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

    sendAction(client, type, data) {
        return new Promise((resolve, reject) => {
            const message = JSON.stringify({type, data});
            try {
                if (client.readyState === ws.OPEN) {
                    client.send(message);
                }
                return resolve(data);
            } catch (err) {
                return reject(err);
            }
        });
    }

    broadcastAction(type, data) {
        return new Promise((resolve, reject) => {
            const message = JSON.stringify({type, data});
            try {
                for (let client of this.socket.clients) {
                    if (client.readyState === ws.OPEN) {
                        client.send(message);
                    }
                }
                return resolve(data);
            } catch (err) {
                return reject(err);
            }
        });
    }
}

module.exports = API;