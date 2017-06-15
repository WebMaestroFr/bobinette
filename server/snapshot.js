const fs = require('fs');
const path = require('path');

const Vision = require('./vision');

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

    constructor(buffer) {
        this._buffer = buffer;
        this.date = new Date();
    }

    save(destination) {
        this.image = `${destination}/${this
            .date
            .toISOString()
            .replace(ISO8601Regex, pathDateFormat)}.jpeg`;
        createPath(this.image);
        fs.writeFileSync(this.image, this._buffer);
        return this.image;
    }

    setDetections(options, overlap = 2 / 3) {
        return Vision
            .detect(options, this._buffer, overlap)
            .then((detections) => {
                return this.detections = detections;
            });
    }

    setFeatures(options, pointOrigin, pointReference, size = {
        width: 64,
        height: 64
    }, overlap = 2 / 3) {
        const transformations = this
            .detections
            .map((detection) => {
                return new Promise((resolve) => {
                    const {x, y, width, height} = detection;
                    const detectionOption = Object.assign({}, options, {
                        region: {
                            x,
                            y,
                            width,
                            height
                        }
                    });
                    return Vision
                        .detect(detectionOption, this._buffer, overlap)
                        .then((features) => {
                            const result = detection.setTransform(features, pointOrigin, pointReference, size);
                            return resolve(result);
                        });
                });
            });
        return Promise.all(transformations);
    }

    toJSON() {
        let {date, image, detections} = this;
        return {date, image, detections};
    }

}

module.exports = Snapshot;