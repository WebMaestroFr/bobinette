const getDistance = (origin, point) => {
    const a = Math.pow(point.x - origin.x, 2);
    const b = Math.pow(point.y - origin.y, 2);
    return Math.sqrt(a + b);
};

class Detection {

    static collect(results, overlap = 1) {
        return results.reduce((detections, region) => {
            const objects = [region];
            for (let d = detections.length - 1; d >= 0; d -= 1) {
                if (detections[d].intersect(region, overlap)) {
                    const intersection = detections.splice(d, 1);
                    objects.concat(intersection.objects);
                }
            }
            detections.push(new Detection(objects));
            return detections;
        }, []).map((detection) => {
            return detection.setRegion();
        });
    }

    constructor(objects) {
        this.objects = objects;
    }

    intersect(subject, overlap) {
        const w = overlap * subject.width;
        const h = overlap * subject.height;
        for (let region of this.objects) {
            // Width difference
            if (Math.max(subject.width, region.width) * overlap > Math.min(subject.width, region.width)) {
                continue;
            }
            // Height difference
            if (Math.max(subject.height, region.height) * overlap > Math.min(subject.height, region.height)) {
                continue;
            }
            // Horizontal position
            if (region.x > (subject.x + subject.width - w) || region.x + region.width < (subject.x + w)) {
                continue;
            }
            // Vertical position
            if (region.y > (subject.y + subject.height - h) || region.y + region.height < (subject.y + h)) {
                continue;
            }
            return true;
        }
        return false;
    }

    setRegion() {
        this.x = this
            .objects
            .reduce((a, b) => {
                return a.x + b.x;
            }, {x: 0}) / this.objects.length;
        this.y = this
            .objects
            .reduce((a, b) => {
                return a.y + b.y;
            }, {y: 0}) / this.objects.length;
        this.width = this
            .objects
            .reduce((a, b) => {
                return a.width + b.width;
            }, {width: 0}) / this.objects.length;
        this.height = this
            .objects
            .reduce((a, b) => {
                return a.height + b.height;
            }, {height: 0}) / this.objects.length;
        return this;
    }

    setTransform(features, pointOrigin, pointReference, size) {
        if (features.length < 2) {
            return null;
        }
        const points = features.map((point) => {
            const {x, y, width, height} = point;
            return {
                x: this.x + x + width / 2,
                y: this.y + y + height / 2
            };
        });
        const absoluteOrigin = {
            x: this.x + size.width * pointOrigin.x,
            y: this.y + size.height * pointOrigin.y
        };
        const absoluteReference = {
            x: this.x + size.width * pointReference.x,
            y: this.y + size.height * pointReference.y
        };
        const origin = points.reduce((a, b) => {
            return getDistance(a, absoluteOrigin) < getDistance(b, absoluteOrigin)
                ? a
                : b;
        });
        const reference = points.reduce((a, b) => {
            return getDistance(a, absoluteReference) < getDistance(b, absoluteReference)
                ? a
                : b;
        });
        const distance = getDistance(origin, reference);
        if (0 === distance) {
            return null;
        }
        this.origin = origin;
        this.reference = reference;
        this.angle = Math.atan2(reference.y - origin.y, reference.x - origin.x) - Math.atan2(absoluteReference.y - absoluteOrigin.y, absoluteReference.x - absoluteOrigin.x);
        this.scale = getDistance(absoluteOrigin, absoluteReference) / distance;
        this.crop = {
            x: origin.x - size.width * pointOrigin.x,
            y: origin.y - size.height * pointOrigin.y,
            width: size.width,
            height: size.height
        };
        return this;
    }
}

module.exports = Detection;