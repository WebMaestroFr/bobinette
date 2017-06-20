"""Object Recognition"""

import argparse
import json
import os.path

import cv2
import numpy

PARSER = argparse.ArgumentParser()

PARSER.add_argument("--image", type=json.loads)
PARSER.add_argument("--label", type=json.loads)
PARSER.add_argument("--region", type=json.loads)
PARSER.add_argument("--model", type=json.loads)

ARGS = PARSER.parse_args()

# CLAHE = cv2.createCLAHE()
GRAY = cv2.imread(ARGS.image, 0)
# GRAY = CLAHE.apply(GRAY)

GRAY = GRAY[ARGS.region["y"]:ARGS.region["y"] + ARGS.region["height"],
            ARGS.region["x"]:ARGS.region["x"] + ARGS.region["width"]]

RECOGNIZER = cv2.face.createLBPHFaceRecognizer()

if os.path.isfile(ARGS.model):
    RECOGNIZER.load(ARGS.model)

RECOGNIZER.update([GRAY], numpy.array([ARGS.label]))
RECOGNIZER.save(ARGS.model)

exit(0)
