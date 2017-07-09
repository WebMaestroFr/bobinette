const fs = require(`fs`);
const path = require(`path`);
const spawn = require(`child_process`).spawn;

const ISO8601Regex = /^.*(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z$/;
const pathDateFormat = `$1/$2/$3/$4-$5-$6_$7`;

const createPath = (destination) => {
    const dirname = path.dirname(destination);
    if (!fs.existsSync(dirname)) {
        createPath(dirname);
        fs.mkdirSync(dirname);
    }
};

class Snapshot {
    constructor(date) {
        this.date = new Date(date);
    }

    get image() {
        return `${this
            .date
            .toISOString()
            .replace(ISO8601Regex, pathDateFormat)}.jpg`;
    }

    write(directory, base64) {
        const buffer = new Buffer(base64, `base64`);
        const destination = path.resolve(directory, this.image);
        createPath(destination);
        fs.writeFileSync(destination, buffer);
    }

    read(directory) {
        const source = path.resolve(directory, this.image);
        const image = fs.readFileSync(source);
        return new Buffer(image).toString(`base64`);
    }
}

const processStdout = (data, callback) => {
    const results = data.split(/}\s*{/);
    const subject = results.length === 1
        ? results[0]
        : `${results[0]}}`;
    try {
        const {date, detections, image} = JSON.parse(subject);
        const snapshot = new Snapshot(date);
        callback({snapshot, detections, image});
    } catch (e) {
        if (e instanceof SyntaxError && results.length === 1) {
            console.error(`\x1b[33m✘\x1b[0m Buffering ...`);
            return data;
        } else {
            console.error(e, subject);
        }
    } finally {
        return (results.length === 1)
            ? ``
            : processStdout(`{${results[1]}`);
    }
};

module.exports = {
    Snapshot: Snapshot,
    detect: (cascade, callback) => {
        const execution = spawn(`python`, [`${__dirname}/${cascade}.py`]);
        let stdout = ``;
        execution
            .stdout
            .on(`data`, (data) => {
                stdout = processStdout(stdout + data.toString(), callback);
            });
        execution
            .stderr
            .on(`data`, (data) => {
                const response = data.toString();
                return console.error(response);
            });
    }
};