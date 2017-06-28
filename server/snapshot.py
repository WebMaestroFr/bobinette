"""Object Detection"""

import base64
import json
import os
import sys
from datetime import datetime

import cv2
import cv2.face
import numpy
import picamera
import picamera.array

THRESHOLD_TRAIN = 2.0 / 3.0
THRESHOLD_CREATE = 4.0 / 7.0
RESOLUTION = (480, 368)
FRAMERATE = 12
THUMBNAIL_SIZE = (64, 64)

CAMERA = picamera.PiCamera()
CAMERA.resolution = RESOLUTION
CAMERA.framerate = 12
CAPTURE = picamera.array.PiRGBArray(CAMERA, size=RESOLUTION)

PATH = os.path.dirname(os.path.realpath(__file__))

CLASSIFIER = cv2.CascadeClassifier(
    "%s/opencv/data/haarcascades/haarcascade_%s.xml" % (PATH, "frontalface_default"))

RECOGNIZER = cv2.face.LBPHFaceRecognizer_create()
# MODEL = "%s/faces.xml" % (PATH)
# if os.path.isfile(MODEL):
#     RECOGNIZER.load(MODEL)

LABELS = list(RECOGNIZER.getLabelsByString(""))
sys.stderr.write("\x1b[1mLabels\x1b[0m %s" % json.dumps(LABELS))


def add_label(thumbnail):
    label = len(LABELS)
    LABELS.append(label)
    RECOGNIZER.update([thumbnail], numpy.array([label]))
    # RECOGNIZER.save(MODEL)
    return label, 1.0


def face(gray, (x, y, width, height)):
    thumbnail = cv2.resize(gray[y:y + height, x:x + width], THUMBNAIL_SIZE)
    if len(LABELS):
        label, distance = RECOGNIZER.predict(thumbnail)
        confidence = round(1.0 - distance / 255.0, 2)
        if confidence > THRESHOLD_TRAIN:
            pass
        elif confidence > THRESHOLD_CREATE:
            RECOGNIZER.update([thumbnail], numpy.array([label]))
            # RECOGNIZER.save(MODEL)
        else:
            label, confidence = add_label(thumbnail)
    else:
        label, confidence = add_label(thumbnail)
    return {
        "x": int(x),
        "y": int(y),
        "width": int(width),
        "height": int(height),
        "prediction": {
            "label": label,
            "confidence": confidence
        }
    }

try:
    for FRAME in CAMERA.capture_continuous(CAPTURE, format="bgr", use_video_port=True):
        DATE = datetime.utcnow()
        _, IMAGE = cv2.imencode(".jpg", FRAME.array,
                                (cv2.IMWRITE_JPEG_OPTIMIZE, True, cv2.IMWRITE_JPEG_QUALITY, 70))
        GRAY = cv2.cvtColor(FRAME.array, cv2.COLOR_BGR2GRAY)
        RESULT = {
            "date": DATE.isoformat(),
            "detections": [face(GRAY, d) for d in CLASSIFIER.detectMultiScale(
                GRAY,
                scaleFactor=1.2,
                minNeighbors=6,
                flags=cv2.CASCADE_SCALE_IMAGE,
                minSize=THUMBNAIL_SIZE
            )],
            "image": base64.b64encode(IMAGE)
        }
        OUTPUT = json.dumps(RESULT)
        sys.stdout.write(OUTPUT)
        sys.stdout.flush()
        CAPTURE.truncate(0)
finally:
    CAMERA.close()
