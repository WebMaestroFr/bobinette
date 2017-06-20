const fs = require('fs');
const path = require('path');

const Detection = require('./detection');

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

    constructor(destination, buffer) {
        this.date = new Date();
        const filename = `${this
            .date
            .toISOString()
            .replace(ISO8601Regex, pathDateFormat)}.jpg`;
        this.image = path.resolve(destination, filename);
        createPath(this.image);
        fs.writeFileSync(this.image, buffer);
    }

    setDetections(options, overlap) {
        const snapshotOptions = Object.assign({}, options, {image: this.image});
        return Detection
            .getInstances(snapshotOptions, overlap)
            .then((detections) => {
                return this.detections = detections;
            });
    }

    setPredictions(model) {
        return Promise.all(this.detections.map((detection) => {
            return detection.setPrediction(this.image, model);
        }));
    }

    get predictions() {
        return this
            .detections
            .map((detection) => {
                return detection.prediction;
            });
    }

    setObjects(options, pointOrigin, pointReference, size, overlap) {
        const snapshotOptions = Object.assign({}, options, {image: this.image});
        return new Promise((resolve) => {
            return Promise.all(this.detections.map((detection) => {
                return detection.setFeatures(snapshotOptions, pointOrigin, pointReference, size, overlap);
            })).then((objects) => {
                this.objects = objects.filter(Boolean);
                return resolve(this.objects);
            });
        });
    }
}

module.exports = Snapshot;