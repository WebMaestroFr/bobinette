'''Face Recognition Constants and Functions'''

from math import atan2, degrees
from os import path

from bobinette import PATH_DATA, PATH_OPENCV
from bobinette.vision import crop_image, get_distance
from cv2 import error as cv_error
from cv2 import (CASCADE_SCALE_IMAGE, CascadeClassifier, face,
                 getRotationMatrix2D, warpAffine)
from numpy import array as numpy_array

CLASSIFIER = CascadeClassifier(
    '%s/data/haarcascades/haarcascade_%s.xml' % (PATH_OPENCV, 'frontalface_default'))
CLASSIFIER_EYE = CascadeClassifier(
    '%s/data/haarcascades/haarcascade_%s.xml' % (PATH_OPENCV, 'eye'))

RECOGNIZER = face.LBPHFaceRecognizer_create()
MODEL = '%s/%s.xml' % (PATH_DATA, 'faces')
if path.isfile(MODEL):
    RECOGNIZER.read(MODEL)

SIZE = (64, 64)

EYE_SIZE = (0.3, 0.3)
EYE_LEFT_CENTER = (0.3, 0.4)
EYE_RIGHT_CENTER = (0.7, 0.4)
EYE_OFFSET = (0.05, 0.05)
EYE_MAX = (
    EYE_SIZE[0] + 2 * EYE_OFFSET[0],
    EYE_SIZE[1] + 2 * EYE_OFFSET[1])
EYE_MIN = (
    EYE_SIZE[0] - 2 * EYE_OFFSET[0],
    EYE_SIZE[1] - 2 * EYE_OFFSET[1])
EYE_LEFT_ORIGIN = (
    EYE_LEFT_CENTER[0] - EYE_SIZE[0] / 2 - EYE_OFFSET[0],
    EYE_LEFT_CENTER[1] - EYE_SIZE[1] / 2 - EYE_OFFSET[1])
EYE_RIGHT_ORIGIN = (
    EYE_RIGHT_CENTER[0] - EYE_SIZE[0] / 2 - EYE_OFFSET[0],
    EYE_RIGHT_CENTER[1] - EYE_SIZE[1] / 2 - EYE_OFFSET[1])

EYES_ANGLE = degrees(atan2(
    EYE_RIGHT_CENTER[1] - EYE_LEFT_CENTER[1],
    EYE_RIGHT_CENTER[0] - EYE_LEFT_CENTER[0]))
EYES_DISTANCE = SIZE[0] * get_distance(EYE_LEFT_CENTER, EYE_RIGHT_CENTER)

EYES_OFFSET = (
    EYE_LEFT_CENTER[0] * SIZE[0],
    EYE_LEFT_CENTER[1] * SIZE[1])

THRESHOLD_CREATE = 0.6
THRESHOLD_PASS = 0.6
THRESHOLD_TRAIN = 0.67


def detect(gray, scale_factor=1.3, min_neighbors=4, min_size=SIZE):
    '''Detect Faces'''
    return CLASSIFIER.detectMultiScale(
        gray,
        scaleFactor=scale_factor,
        minNeighbors=min_neighbors,
        flags=CASCADE_SCALE_IMAGE,
        minSize=min_size)


def detect_eyes(gray, scale_factor=1.1, min_neighbors=4, min_size=SIZE):
    '''Detect Eyes'''
    return CLASSIFIER_EYE.detectMultiScale(
        gray,
        scaleFactor=scale_factor,
        minNeighbors=min_neighbors,
        flags=CASCADE_SCALE_IMAGE,
        minSize=min_size)


def get_eye_center(gray, roi=None, **kwargs):
    """Center Point of Single Eye Region"""
    if roi:
        eye_gray = crop_image(gray, *roi)
    else:
        roi = (0, 0)
        eye_gray = gray
    eyes = detect_eyes(eye_gray, **kwargs)
    if len(eyes) == 1:
        return (
            roi[0] + eyes[0][0] + eyes[0][2] / 2,
            roi[1] + eyes[0][1] + eyes[0][3] / 2)
    return None


def transform(region, gray, **kwargs):
    """Transform Face Image"""
    min_size = (int(round(EYE_MIN[0] * region['width'])),
                int(round(EYE_MIN[1] * region['height'])))
    max_size = (int(round(EYE_MAX[0] * region['width'])),
                int(round(EYE_MAX[1] * region['height'])))
    left = get_eye_center(gray, (
        int(round(region['x'] + EYE_LEFT_ORIGIN[0] * region['width'])),
        int(round(region['y'] + EYE_LEFT_ORIGIN[1] * region['height'])),
        max_size[0],
        max_size[1]
    ), min_size=min_size, **kwargs)
    if left:
        right = get_eye_center(gray, (
            int(round(region['x'] + EYE_RIGHT_ORIGIN[0] * region['width'])),
            int(round(region['y'] + EYE_RIGHT_ORIGIN[1] * region['height'])),
            max_size[0],
            max_size[1]
        ), min_size=min_size, **kwargs)
        if right:
            angle = degrees(atan2(
                right[1] - left[1],
                right[0] - left[0]
            )) - EYES_ANGLE
            scale = EYES_DISTANCE / get_distance(left, right)
            matrix = getRotationMatrix2D(left, angle, scale)
            image = warpAffine(gray, matrix, gray.shape)
            return crop_image(
                image,
                int(round(left[0] - EYES_OFFSET[0])),
                int(round(left[1] - EYES_OFFSET[1])),
                SIZE[0],
                SIZE[1])
    return None


def predict(image):
    '''Image Face Recognition'''
    try:
        label_id, distance = RECOGNIZER.predict(image)
        confidence = 1.0 - distance / 255.0
    except cv_error:
        label_id = None
        confidence = 0.0
    return label_id, confidence


def train(label_id, *images):
    '''Add Face to Label Collection'''
    RECOGNIZER.update(images, numpy_array([label_id] * len(images)))
    RECOGNIZER.write(MODEL)
