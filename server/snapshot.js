const fs = require(`fs`);
const path = require(`path`);

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

    static byLabel(label) {}

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

module.exports = Snapshot;