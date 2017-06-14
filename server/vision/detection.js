class Detection {

    static collect(objects, overlap = 1) {
        return objects.reduce((detections, region) => {
            const regions = [region];
            for (let d = detections.length - 1; d >= 0; d -= 1) {
                if (detections[d].intersect(region, overlap)) {
                    const intersection = detections.splice(d, 1);
                    regions.concat(intersection.regions);
                }
            }
            detections.push(new Detection(regions));
            return detections;
        }, [])
    }

    constructor(regions) {
        this.regions = regions;
    }

    intersect(subject, overlap) {
        const w = overlap * subject.width;
        const h = overlap * subject.height;
        for (let region of this.regions) {
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

    toJSON() {
        switch (this.regions.length) {
            case 0:
                return null;
            case 1:
                return this.regions[0];
            default:
                return {
                    x: this
                        .regions
                        .reduce((a, b) => {
                            return a.x + b.x;
                        }, {x: 0}) / this.regions.length,
                    y: this
                        .regions
                        .reduce((a, b) => {
                            return a.y + b.y;
                        }, {y: 0}) / this.regions.length,
                    width: this
                        .regions
                        .reduce((a, b) => {
                            return a.width + b.width;
                        }, {width: 0}) / this.regions.length,
                    height: this
                        .regions
                        .reduce((a, b) => {
                            return a.height + b.height;
                        }, {height: 0}) / this.regions.length
                };
        }
    }
}

module.exports = Detection;