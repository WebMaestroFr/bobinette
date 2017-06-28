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


def json_serial(obj):
    """JSON serializer for objects not serializable by default json code"""

    if isinstance(obj, (datetime)):
        serial = obj.isoformat()
        return serial
    raise TypeError("Type %s not serializable" % type(obj))

CAMERA = picamera.PiCamera()
CAMERA.resolution = (480, 368)
CAMERA.framerate = 12
CAPTURE = picamera.array.PiRGBArray(CAMERA, size=CAMERA.resolution)

PATH = os.path.dirname(os.path.realpath(__file__))

CLASSIFIER = cv2.CascadeClassifier(
    "%s/opencv/data/haarcascades/haarcascade_%s.xml" % (PATH, "frontalface_default"))

RECOGNIZER = cv2.face.LBPHFaceRecognizer_create()
# MODEL = "%s/faces.xml" % (PATH)
# if os.path.isfile(MODEL):
#     RECOGNIZER.load(MODEL)

LABELS = list(RECOGNIZER.getLabelsByString(""))
sys.stderr.write("\x1b[1mLabels\x1b[0m %s" %
                 json.dumps(LABELS, default=json_serial))


def add_label(thumbnail):
    label = len(LABELS)
    LABELS.append(label)
    RECOGNIZER.update([thumbnail], numpy.array([label]))
    # RECOGNIZER.save(MODEL)
    return label, 1.0


def face(gray, (x, y, width, height)):
    thumbnail = cv2.resize(gray[y:y + height, x:x + width], (64, 64))
    if len(LABELS):
        label, distance = RECOGNIZER.predict(thumbnail)
        confidence = 1.0 - int(100 * distance / 255) / 100.0
        if confidence > (2.0 / 3.0):
            sys.stderr.write("\x1b[1m%s\x1b[0m => \x1b[32m%s\x1b[0m" % (
                label, confidence))
        elif confidence > (1.0 / 2.0):
            RECOGNIZER.update([thumbnail], numpy.array([label]))
            # RECOGNIZER.save(MODEL)
            sys.stderr.write("\x1b[1m%s\x1b[0m => \x1b[33m%s\x1b[0m" % (
                label, confidence))
        else:
            label, confidence = add_label(thumbnail)
            sys.stderr.write("\x1b[1m%s\x1b[0m => \x1b[31mNEW\x1b[0m" % (
                label))
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
        _, IMAGE = cv2.imencode(".jpg", FRAME.array,
                                (cv2.IMWRITE_JPEG_OPTIMIZE, True, cv2.IMWRITE_JPEG_QUALITY, 70))
        # IMAGE = CLAHE.apply(IMAGE)
        GRAY = cv2.cvtColor(FRAME.array, cv2.COLOR_BGR2GRAY)
        # GRAY = CLAHE.apply(GRAY)
        RESULT = {
            "date": datetime.utcnow(),
            "detections": [face(GRAY, d) for d in CLASSIFIER.detectMultiScale(
                GRAY,
                scaleFactor=1.2,
                minNeighbors=6,
                flags=cv2.CASCADE_SCALE_IMAGE,
                minSize=(64, 64)
            )],
            "image": base64.b64encode(IMAGE)
        }
        OUTPUT = json.dumps(RESULT, default=json_serial)
        sys.stdout.write(OUTPUT)
        sys.stdout.flush()
        CAPTURE.truncate(0)
finally:
    CAMERA.close()
