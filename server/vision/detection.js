class Detection {

    static collect(results, overlap = 2 / 3) {
        return results.reduce((groups, region) => {
            const group = [region];
            const w = overlap * region.width;
            const h = overlap * region.height;
            eachGroup : for (let g = groups.length - 1; g >= 0; g -= 1) {
                eachRegion : for (let roi of groups[g]) {
                    // Width difference
                    if (Math.max(region.width, roi.width) * overlap > Math.min(region.width, roi.width)) {
                        continue eachRegion;
                    }
                    // Height difference
                    if (Math.max(region.height, roi.height) * overlap > Math.min(region.height, roi.height)) {
                        continue eachRegion;
                    }
                    // Horizontal position
                    if (roi.x > (region.x + region.width - w) || roi.x + roi.width < (region.x + w)) {
                        continue eachRegion;
                    }
                    // Vertical position
                    if (roi.y > (region.y + region.height - h) || roi.y + roi.height < (region.y + h)) {
                        continue eachRegion;
                    }
                    const intersection = groups.splice(g, 1);
                    group.concat(intersection);
                    continue eachGroup;
                }
            }
            groups.push(group);
            return groups;
        }, []).map((group) => {
            return new Detection(group);
        })
    }

    constructor(group) {
        this.region = {
            x: group.reduce((a, b) => {
                return a.x + b.x;
            }, {x: 0}) / group.length,
            y: group.reduce((a, b) => {
                return a.y + b.y;
            }, {y: 0}) / group.length,
            width: group.reduce((a, b) => {
                return a.width + b.width;
            }, {width: 0}) / group.length,
            height: group.reduce((a, b) => {
                return a.height + b.height;
            }, {height: 0}) / group.length
        };
    }
}

module.exports = Detection;