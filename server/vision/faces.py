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

THRESHOLD_TRAIN = 0.67
THRESHOLD_CREATE = 0.5
RESOLUTION = (480, 368)
FRAMERATE = 12
THUMBNAIL_SIZE = (64, 64)

CAMERA = picamera.PiCamera()
CAMERA.resolution = RESOLUTION
CAMERA.framerate = FRAMERATE
CAPTURE = picamera.array.PiRGBArray(CAMERA, size=RESOLUTION)

PATH = os.path.dirname(os.path.realpath(__file__))

CLASSIFIER = cv2.CascadeClassifier(
    "%s/opencv/data/haarcascades/haarcascade_%s.xml" % (PATH, "frontalface_default"))

RECOGNIZER = cv2.face.LBPHFaceRecognizer_create()
MODEL = "%s/faces.xml" % (PATH)
if os.path.isfile(MODEL):
    RECOGNIZER.read(MODEL)


def get_index():
    labels = RECOGNIZER.getLabels()
    if labels is None:
        return 0
    else:
        return len(set(labels.flatten()))


def add_label(thumbnail):
    index = get_index()
    RECOGNIZER.update([thumbnail], numpy.array([index]))
    RECOGNIZER.write(MODEL)
    return index, 1.0


def face(gray, (x, y, width, height)):
    thumbnail = cv2.resize(gray[y:y + height, x:x + width], THUMBNAIL_SIZE)
    if get_index() > 0:
        label, distance = RECOGNIZER.predict(thumbnail)
        confidence = round(1.0 - distance / 255.0, 2)
        if confidence > THRESHOLD_TRAIN:
            pass
        elif confidence > THRESHOLD_CREATE:
            RECOGNIZER.update([thumbnail], numpy.array([label]))
            RECOGNIZER.write(MODEL)
        else:
            label, confidence = add_label(thumbnail)
    else:
        label, confidence = add_label(thumbnail)
    return {
        "x": int(x),
        "y": int(y),
        "width": int(width),
        "height": int(height),
        "label": label,
        "confidence": confidence
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
                scaleFactor=1.25,
                minNeighbors=5,
                flags=cv2.CASCADE_SCALE_IMAGE,
                minSize=THUMBNAIL_SIZE
            )],
            "image": base64.b64encode(IMAGE)
        }
        OUTPUT = json.dumps(RESULT)

        # sys.stderr.write("\x1b[32m%s\x1b[0m %s" %
        #                  (u"\u2714".encode("utf8"), DATE.isoformat()))
        # sys.stderr.flush()

        sys.stdout.write(OUTPUT)
        sys.stdout.flush()

        CAPTURE.truncate(0)
finally:
    CAMERA.close()
