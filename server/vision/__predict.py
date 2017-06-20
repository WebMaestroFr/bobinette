"""Object Recognition"""

import argparse
import json
import os.path
import sys

import cv2

PARSER = argparse.ArgumentParser()

PARSER.add_argument("--image", type=json.loads)
PARSER.add_argument("--region", type=json.loads)
PARSER.add_argument("--model", type=json.loads)

ARGS = PARSER.parse_args()

if os.path.isfile(ARGS.model):

    # CLAHE = cv2.createCLAHE()
    GRAY = cv2.imread(ARGS.image, 0)
    # GRAY = CLAHE.apply(GRAY)

    GRAY = GRAY[ARGS.region["y"]:ARGS.region["y"] + ARGS.region["height"],
                ARGS.region["x"]:ARGS.region["x"] + ARGS.region["width"]]

    RECOGNIZER = cv2.face.createLBPHFaceRecognizer()
    RECOGNIZER.load(ARGS.model)

    LABEL, CONFIDENCE = RECOGNIZER.predict(GRAY)

    RESULT = {"label": LABEL, "confidence": CONFIDENCE}

else:
    RESULT = None

OUTPUT = json.dumps(RESULT)
sys.stdout.write(OUTPUT)

sys.stdout.close()
exit(0)
