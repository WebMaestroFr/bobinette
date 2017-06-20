"""Object Detection"""

import argparse
import json
import os
import sys

import cv2

PATH = os.path.dirname(os.path.realpath(__file__))

PARSER = argparse.ArgumentParser()

PARSER.add_argument("--image", type=json.loads)
PARSER.add_argument("--cascade", type=json.loads)
PARSER.add_argument("--scale", type=json.loads, default=1.1)
PARSER.add_argument("--neighbors", type=json.loads, default=2)
PARSER.add_argument("--size", type=json.loads, default=[32, 32])
PARSER.add_argument("--flip", type=json.loads, default=False)
PARSER.add_argument("--region", type=json.loads, default=None)

ARGS = PARSER.parse_args()

# CLAHE = cv2.createCLAHE()

GRAY = cv2.imread(ARGS.image, 0)
# gray = CLAHE.apply(gray)

if ARGS.region:
    GRAY = GRAY[ARGS.region["y"]:ARGS.region["y"] + ARGS.region["height"],
                ARGS.region["x"]:ARGS.region["x"] + ARGS.region["width"]]
if ARGS.flip:
    GRAY = cv2.flip(GRAY, 1)


def flip(roi):
    """Flip regions"""
    roi.x = GRAY.cols - roi.x - roi.width
    return roi

CLASSIFIER = cv2.CascadeClassifier(
    "%s/opencv/data/haarcascades/haarcascade_%s.xml" % (PATH, ARGS.cascade))

RESULTS = CLASSIFIER.detectMultiScale(
    GRAY,
    scaleFactor=ARGS.scale,
    minNeighbors=ARGS.neighbors,
    flags=cv2.CASCADE_SCALE_IMAGE,
    minSize=tuple(ARGS.size)
)

if ARGS.flip:
    RESULTS = map(flip, RESULTS)

# cv2.imwrite('/home/pi/Desktop/gray.jpg', gray)


OUTPUT = json.dumps([{"x": int(x), "y": int(y), "width": int(width),
                      "height": int(height)} for (x, y, width, height) in RESULTS])
sys.stdout.write(OUTPUT)

sys.stdout.close()
exit(0)
