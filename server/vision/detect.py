"""Object Detection"""

import argparse
import json
import os
import sys

import cv2
import numpy

PATH = os.path.dirname(os.path.realpath(__file__))

PARSER = argparse.ArgumentParser()

# import base64
# PARSER.add_argument("--image", type=base64.b64decode)
# IMAGE = numpy.fromstring(ARGS.image, dtype=numpy.uint8)

PARSER.add_argument("--cascade", type=json.loads)
PARSER.add_argument("--scale", type=json.loads, default=1.1)
PARSER.add_argument("--neighbors", type=json.loads, default=4)
PARSER.add_argument("--size", type=json.loads, default=[32, 32])
PARSER.add_argument("--flip", type=json.loads, default=False)
PARSER.add_argument("--region", type=json.loads, default=None)

ARGS = PARSER.parse_args()

# CLAHE = cv2.createCLAHE()


def detect(image):
    """Detect objects"""

    if ARGS.region:
        image = image[ARGS.region.y:ARGS.region.y + ARGS.region.height,
                      ARGS.region.x:ARGS.region.x + ARGS.region.width]

    gray = cv2.imdecode(image, 0)
    # gray = CLAHE.apply(gray)
    if ARGS.flip:
        gray = cv2.flip(gray, 1)

    def flip(roi):
        """Flip regions"""
        roi.x = gray.cols - roi.x - roi.width
        return roi

    classifier = cv2.CascadeClassifier(
        "%s/opencv/data/haarcascades/haarcascade_%s.xml" % (PATH, ARGS.cascade))

    # sys.stderr.write(json.dumps(["haarcascade_%s.xml" % (
    #     ARGS.cascade), ARGS.scale, ARGS.neighbors, tuple(ARGS.size)]))

    results = classifier.detectMultiScale(
        gray,
        scaleFactor=ARGS.scale,
        minNeighbors=ARGS.neighbors,
        flags=cv2.CASCADE_SCALE_IMAGE,
        minSize=tuple(ARGS.size)
    )

    if ARGS.flip:
        results = map(flip, results)

    # cv2.imwrite('/home/pi/Desktop/gray.jpg', gray)

    return [{"x": int(x), "y": int(y), "width": int(width),
             "height": int(height)} for (x, y, width, height) in results]


INPUT = sys.stdin.read()
IMAGE = numpy.frombuffer(INPUT, dtype=numpy.uint8)
RESULTS = detect(IMAGE)
OUTPUT = json.dumps(RESULTS)
sys.stdout.write(OUTPUT)

sys.stdout.close()
exit(0)
