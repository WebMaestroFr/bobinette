"""Object Detection"""

from base64 import b64encode
from os import path

from cv2 import (CASCADE_SCALE_IMAGE, COLOR_BGR2GRAY, IMWRITE_JPEG_OPTIMIZE,
                 IMWRITE_JPEG_QUALITY, CascadeClassifier, cvtColor, face,
                 imencode, resize)
from numpy import array

THRESHOLD_TRAIN = 0.75
THRESHOLD_PASS = 0.67
THRESHOLD_CREATE = 0.625
THUMBNAIL_SIZE = (64, 64)

CURRENT_PATH = path.dirname(__file__)
DATA_PATH = path.realpath("%s/../../data" % (CURRENT_PATH))
OPENCV_PATH = path.realpath("%s/../../libraries/opencv" % (CURRENT_PATH))

CLASSIFIER_FACE = CascadeClassifier(
    "%s/data/haarcascades/haarcascade_%s.xml" % (OPENCV_PATH, "frontalface_default"))
CLASSIFIER_EYE = CascadeClassifier(
    "%s/data/haarcascades/haarcascade_%s.xml" % (OPENCV_PATH, "eye"))

RECOGNIZER = face.LBPHFaceRecognizer_create()
MODEL = "%s/faces.xml" % (DATA_PATH)
if path.isfile(MODEL):
    RECOGNIZER.read(MODEL)


def get_index():
    """Returns Next Label Index"""
    labels = RECOGNIZER.getLabels()
    if labels is None:
        return 0
    else:
        return len(set(labels.flatten()))


def write_label(thumbnail):
    """Writes New Label"""
    index = get_index()
    RECOGNIZER.update([thumbnail], array([index]))
    RECOGNIZER.write(MODEL)
    return index, 1.0


def get_face(gray, frame, (f_x, f_y, width, height)):
    """Returns Face Detection"""
    face_gray = gray[f_y:f_y + height, f_x:f_x + width]
    features = CLASSIFIER_EYE.detectMultiScale(
        face_gray,
        scaleFactor=1.1,
        minNeighbors=4,
        flags=CASCADE_SCALE_IMAGE,
        minSize=(16, 16)
    )
    thumbnail = resize(face_gray, THUMBNAIL_SIZE)
    if len(features) == 2:
        if get_index() > 0:
            label, distance = RECOGNIZER.predict(thumbnail)
            confidence = round(1.0 - distance / 255.0, 2)
            if confidence <= THRESHOLD_CREATE:
                label, confidence = write_label(thumbnail)
            elif confidence >= THRESHOLD_PASS and confidence <= THRESHOLD_TRAIN:
                RECOGNIZER.update([thumbnail], array([label]))
                RECOGNIZER.write(MODEL)
        else:
            label, confidence = write_label(thumbnail)
    else:
        label = None
        confidence = 0
    image = resize(
        frame[f_y:f_y + height, f_x:f_x + width], THUMBNAIL_SIZE)
    _, image = imencode(".jpg", image, (IMWRITE_JPEG_OPTIMIZE, True,
                                        IMWRITE_JPEG_QUALITY, 70))
    return {
        "x": int(f_x),
        "y": int(f_y),
        "width": int(width),
        "height": int(height),
        "label": label,
        "confidence": confidence,
        "image": b64encode(image),
        "features": [f.tolist() for f in features]
    }


def detect(frame):
    """Face Detection"""
    gray = cvtColor(frame, COLOR_BGR2GRAY)
    detections = CLASSIFIER_FACE.detectMultiScale(
        gray,
        scaleFactor=1.3,
        minNeighbors=6,
        flags=CASCADE_SCALE_IMAGE,
        minSize=(64, 64)
    )
    return [get_face(gray, frame, d) for d in detections]
