const fs = require('fs');
const path = require('path');

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
    constructor(date, detections) {
        this.date = date;
        this.detections = detections;
    }
    save(destination, buffer) {
        this.image = `${destination}/${this
            .date
            .toISOString()
            .replace(ISO8601Regex, pathDateFormat)}.jpeg`;
        createPath(this.image);
        fs.writeFileSync(this.image, buffer);
    }
}

module.exports = Snapshot;