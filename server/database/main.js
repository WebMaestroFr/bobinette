const path = require(`path`);
const sqlite3 = require(`sqlite3`).verbose();

class Database {
    static open(base, tables) {
        return new Promise((resolve, reject) => {
            const destination = path.resolve(__dirname, `../../data/${base}.sqlite3`);
            const db = new sqlite3.Database(destination);
            db.on(`error`, reject);
            return db.on(`open`, () => {
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
            const query = `CREATE TABLE IF NOT EXISTS ${name} (${definition.join(", ")})`;
            return this
                ._db
                .run(query, (err) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(query);
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
            const query = `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${Object
                .keys(data)
                .join(", ")})`;
            return this
                ._db
                .run(query, data, (err) => {
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
                    return resolve(rows);
                });
        });
    }

    update(table, values, key = `id`) {
        return new Promise((resolve, reject) => {
            const columns = Object.keys(values);
            const data = {};
            for (let column of columns) {
                data[`:${column}`] = values[column];
            }
            const query = `UPDATE ${table} SET ${columns.map((column) => `${column} = :${column}`).join(", ")} WHERE ${key} = :${key}`;
            return this
                ._db
                .run(query, data, (err) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(values);
                });
        });
    }
}

module.exports = Database;