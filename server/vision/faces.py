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

THRESHOLD_TRAIN = 0.75
THRESHOLD_CREATE = 0.625
RESOLUTION = (480, 368)
FRAMERATE = 4
THUMBNAIL_SIZE = (64, 64)
SCALE = 1.33
NEIGHBORS = 8
JPEG_QUALITY = 70

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


def add_label(image_gray):
    index = get_index()
    RECOGNIZER.update([image_gray], numpy.array([index]))
    RECOGNIZER.write(MODEL)
    return index, 1.0


def face(gray, frame, (x, y, width, height)):
    image_gray = cv2.resize(gray[y:y + height, x:x + width], THUMBNAIL_SIZE)
    if get_index() > 0:
        label, distance = RECOGNIZER.predict(image_gray)
        confidence = round(1.0 - distance / 255.0, 2)
        if confidence < THRESHOLD_CREATE:
            label, confidence = add_label(image_gray)
        elif confidence < THRESHOLD_TRAIN:
            RECOGNIZER.update([image_gray], numpy.array([label]))
            RECOGNIZER.write(MODEL)
    else:
        label, confidence = add_label(image_gray)

    image = cv2.resize(frame[y:y + height, x:x + width], THUMBNAIL_SIZE)
    _, image = cv2.imencode(".jpg", image,
                            (cv2.IMWRITE_JPEG_OPTIMIZE, True, cv2.IMWRITE_JPEG_QUALITY, JPEG_QUALITY))

    return {
        "x": int(x),
        "y": int(y),
        "width": int(width),
        "height": int(height),
        "label": label,
        "confidence": confidence,
        "image": base64.b64encode(image)
    }

try:
    for FRAME in CAMERA.capture_continuous(CAPTURE, format="bgr", use_video_port=True):
        DATE = datetime.utcnow()
        _, IMAGE = cv2.imencode(".jpg", FRAME.array,
                                (cv2.IMWRITE_JPEG_OPTIMIZE, True, cv2.IMWRITE_JPEG_QUALITY, JPEG_QUALITY))
        GRAY = cv2.cvtColor(FRAME.array, cv2.COLOR_BGR2GRAY)

        RESULT = {
            "date": DATE.isoformat(),
            "detections": [face(GRAY, FRAME.array, d) for d in CLASSIFIER.detectMultiScale(
                GRAY,
                scaleFactor=SCALE,
                minNeighbors=NEIGHBORS,
                flags=cv2.CASCADE_SCALE_IMAGE,
                minSize=THUMBNAIL_SIZE
            )],
            "image": base64.b64encode(IMAGE)
        }
        OUTPUT = json.dumps(RESULT)

        sys.stdout.write(OUTPUT)
        sys.stdout.flush()

        CAPTURE.truncate(0)
except Exception, error:
    sys.stderr.write(error)
    sys.stderr.flush()
finally:
    CAMERA.close()
