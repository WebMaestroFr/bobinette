const express = require(`express`);

class API {
    constructor(port, staticDirectory) {
        const appStatic = express.static(staticDirectory);
        this.router = express();
        this
            .router
            .use(appStatic);

        this.server = require(`http`).createServer(this.router);
        this
            .server
            .listen(port, () => {
                console.error(`\x1b[32m✔ API Server\x1b[0m`, port);
            });
    }
}

module.exports = API;