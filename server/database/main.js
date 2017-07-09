const path = require(`path`);
const sqlite3 = require(`sqlite3`).verbose();

class Database {
    static open(name, tables) {
        return new Promise((resolve, reject) => {
            const destination = path.resolve(__dirname, `${name}.sqlite3`);
            const db = new sqlite3.Database(destination);
            db.on(`error`, reject);
            return db.on(`open`, () => {
                console.error(`\x1b[32m✔\x1b[0m Database \x1b[1m${name}\x1b[0m`);
                const instance = new Database(db);
                return resolve(instance);
            });
        });
    }

    constructor(db) {
        this._db = db;
    }

    createTable(name, definition) {
        return new Promise((resolve, reject) => {
            return this
                ._db
                .run(`CREATE TABLE IF NOT EXISTS ${name} (${definition.join(", ")})`, (err) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve();
                });
        });
    }

    insert(table, values) {
        return new Promise((resolve, reject) => {
            const columns = Object.keys(values);
            const data = {};
            for (let column of columns) {
                data[`:${column}`] = values[column];
            }
            return this
                ._db
                .run(`INSERT INTO ${table} (${columns.join(", ")}) VALUES (${Object.keys(data).join(", ")})`, data, (err) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(values);
                });
        });
    }

    select(table, params = ``) {
        return new Promise((resolve, reject) => {
            return this
                ._db
                .all(`SELECT * FROM ${table} ${params}`, (err, rows) => {
                    if (err) {
                        return reject(err);
                    }
                    console.error(`\x1b[32m✔\x1b[0m Select \x1b[1m${table}\x1b[0m (${rows.length} results)`);
                    return resolve(rows);
                });
        });
    }

    get(table, params = ``) {
        return new Promise((resolve, reject) => {
            return this
                ._db
                .get(`SELECT * FROM ${table} ${params}`, (err, rows) => {
                    if (err) {
                        return reject(err);
                    }
                    console.error(`\x1b[32m✔\x1b[0m Get \x1b[1m${table}\x1b[0m`);
                    return resolve(rows);
                });
        });
    }
}

module.exports = Database;