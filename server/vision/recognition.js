// Computer Vision
const cv = require("opencv");

const recognizer = cv
    .FaceRecognizer
    .createLBPHFaceRecognizer();

const read = (data, callback) => {
    try {
        cv.readImage(data, (err, matrix) => {
            if (err) {
                console.error("Read Matrix", err);
            } else {
                callback(matrix);
            }
        });
    } catch (err) {
        console.error("Read Image", err);
    }
};

const getDistance = (origin, point) => {
    const a = Math.pow(point.x - origin.x, 2);
    const b = Math.pow(point.y - origin.y, 2);
    return Math.sqrt(a + b);
};

module.exports = {
    train: (matrices, label) => {
        const labels = new Array(matrices.length).fill(label);
        recognizer.update(matrices, labels);
    },
    match: (matrix) => {
        recognizer.predict(matrix, (err, prediction) => {
            if (err) {
                console.error("Detect Objects", err);
            } else {
                callback(prediction);
            }
        });
    },
    transform: (face, eyes, size = {
        width: 64,
        height: 64
    }, refOrigin = {
        x: 1 / 4,
        y: 1 / 4
    }, refPoint = {
        x: 3 / 4,
        y: 1 / 4
    }) => {
        if (eyes.length < 2) {
            return null;
        }
        const points = eyes.map((eye) => {
            const {x, y, width, height} = eye.region;
            return {
                x: face.region.x + x + width / 2,
                y: face.region.y + y + height / 2
            };
        });
        const refOriginAbs = {
            x: face.region.x + size.width * refOrigin.x,
            y: face.region.y + size.height * refOrigin.y
        };
        const refPointAbs = {
            x: face.region.x + 3 * size.width * refPoint.x,
            y: face.region.y + size.height * refPoint.y
        };
        const origin = points.reduce((a, b) => {
            return getDistance(a, refOriginAbs) < getDistance(b, refOriginAbs)
                ? a
                : b;
        });
        const destination = points.reduce((a, b) => {
            return getDistance(a, refPointAbs) < getDistance(b, refPointAbs)
                ? a
                : b;
        });
        const distance = getDistance(origin, destination);
        if (0 === distance) {
            return null;
        }
        const angle = Math.atan2(destination.y - origin.y, destination.x - origin.x) - Math.atan2(refPointAbs.y - refOriginAbs.y, refPointAbs.x - refOriginAbs.x);
        const scale = getDistance(refOriginAbs, refPointAbs) / distance;
        return {
            origin: origin,
            destination: destination,
            angle: angle,
            crop: {
                x: origin.x - size.width * refOrigin.x,
                y: origin.y - size.height * refOrigin.y,
                width: size.width,
                height: size.height
            },
            scale: scale
        };
    },
    matrix: (data, {
        origin,
        angle,
        crop: {
            x,
            y,
            width,
            height
        },
        scale
    }, callback) => {
        try {
            read(data, (image) => {
                const rotation = cv
                    .Matrix
                    .getRotationMatrix2D(angle * 180 / Math.PI, origin.x, origin.y, scale);
                const clone = image.clone();
                clone.warpAffine(rotation, x + width, y + height);
                const matrix = clone.crop(x, y, width, height);
                callback(matrix);
            });
        } catch (err) {
            console.error("Read Image", err);
        }
    }
};