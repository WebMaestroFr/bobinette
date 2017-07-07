const path = require(`path`);

const sqlite3 = require(`sqlite3`).verbose();

class Database {
    static open(name, tables) {
        return new Promise((resolve, reject) => {
            const destination = path.resolve(__dirname, `${name}.sqlite3`);
            const db = new sqlite3.Database(destination);
            db.on(`error`, reject);
            return db.on(`open`, () => {
                console.error(`\x1b[32m✔ Database \x1b[1m${name}\x1b[0m`);
                const instance = new Database(db);
                return resolve(instance);
            });
        });
    }

    constructor(db) {
        this._db = db;
    }

    createTable(name, definition) {
        return this
            ._db
            .run(`CREATE TABLE IF NOT EXISTS ${name} (${definition.join(", ")})`);
    }

    insert(table, values) {
        const columns = Object.keys(values);
        const data = {};
        for (let column of columns) {
            data[`:${column}`] = values[column];
        }
        return this
            ._db
            .run(`INSERT INTO ${table} (${columns.join(", ")}) VALUES (${Object.keys(data).join(", ")})`, data);
    }

    select(table) {
        return new Promise((resolve, reject) => {
            return this
                ._db
                .all(`SELECT * FROM ${table}`, function(err, rows) {
                    if (err) {
                        return reject(err);
                    }
                    console.error(`\x1b[32m✔ Select \x1b[1m${table}\x1b[0m (${rows.length} results)`);
                    return resolve(rows);
                });
        });
    }
}

module.exports = Database;