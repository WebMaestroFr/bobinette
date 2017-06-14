const path = require('path');

class Snapshot {
    constructor(date, filename, detection) {
        this.date = date;
        this.image = filename;
        this.detection = detection;
    }
}

class Sequence {
    constructor(date, filename, detection) {
        this.date = date;
        this.snapshots = [new Snapshot(date, filename, detection)];
        this._region = detection.region;
    }

    update(date, filename, detections) {
        if (null !== this._region) {
            // Sequence is currently running
            for (const d in detections) {
                if (detections[d] && detections[d].intersect(this._region, 2 / 3)) {
                    // ROI intersects with last frame
                    this
                        .snapshots
                        .push(new Snapshot(date, filename, detections[d]));
                    this._region = detections[d].region;
                    return d;
                }
            }
            this._region = null;
        }
        return false;
    }
}

class Session {

    constructor() {
        this.sequences = [];
        this._timestamp = null;
    }

    update(detections, image, callback) {

        const date = new Date();

        if (0 === this.sequences.length) {
            // Reset empty session
            this.date = this._timestamp = date;
        }

        if (detections.length) {
            // Activity Stamp
            this._timestamp = date;

            // Save snapshot
            const filename = path.join("img", date.toISOString() + ".jpg");
            image.save(path.join(__dirname, '../..', "client/public", filename));
            console.error("=>", filename);

            for (const sequence of this.sequences) {
                let s = sequence.update(date, filename, detections);
                if (false !== s) {
                    // Intersection
                    detections.splice(s, 1);
                }
            }

            for (const detection of detections) {
                console.error("\n=> New Sequence");
                this
                    .sequences
                    .push(new Sequence(date, filename, detection));
            }
        }

        // Time silence
        callback(date - this._timestamp);
    }
}

module.exports = {
    Session: Session,
    Sequence: Sequence,
    Snapshot: Snapshot
};