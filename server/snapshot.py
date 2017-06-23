"""Object Detection"""

import base64
import json
import os
import sys
from datetime import datetime

import cv2
import picamera

CAMERA = picamera.PiCamera()
CAMERA.resolution = (480, 360)
CAMERA.framerate = 12
CAPTURE = picamera.array.PiRGBArray(CAMERA, size=CAMERA.resolution)

PATH = os.path.dirname(os.path.realpath(__file__))

CLASSIFIER = cv2.CascadeClassifier(
    "%s/opencv/data/haarcascades/haarcascade_%s.xml" % (PATH, "frontalface_default"))

RECOGNIZER = cv2.face.createLBPHFaceRecognizer()
MODEL = "%s/faces.xml" % (PATH)
if os.path.isfile(MODEL):
    RECOGNIZER.load(MODEL)

CLAHE = cv2.createCLAHE()


def face(gray, (x, y, width, height)):
    gray = gray[y:y + height, x:x + width]
    label, confidence = RECOGNIZER.predict(gray)
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
        IMAGE = CLAHE.apply(FRAME.array)
        GRAY = cv2.cvtColor(IMAGE, cv2.COLOR_BGR2GRAY)
        RETVAL, BUFFER = cv2.imencode(".jpg", IMAGE)
        RESULT = {
            "date": datetime.utcnow(),
            "faces": [face(GRAY, d) for d in CLASSIFIER.detectMultiScale(
                GRAY,
                scaleFactor=1.1,
                minNeighbors=4,
                flags=cv2.CASCADE_SCALE_IMAGE,
                minSize=(64, 64)
            )],
            "image": base64.b64encode(BUFFER)
        }
        OUTPUT = json.dumps(RESULT)
        sys.stdout.write(OUTPUT)
        sys.stdout.flush()
        CAPTURE.truncate(0)
finally:
    CAMERA.close()
