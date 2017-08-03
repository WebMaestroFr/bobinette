"""Object Detection"""

from base64 import b64encode
from math import atan2, degrees, sqrt
from os import path

from cv2 import (BORDER_CONSTANT, CASCADE_SCALE_IMAGE, IMWRITE_JPEG_OPTIMIZE,
                 IMWRITE_JPEG_QUALITY, CascadeClassifier, face,
                 getRotationMatrix2D, imencode, resize, warpAffine)
from numpy import array

THRESHOLD_CREATE = 0.65
THRESHOLD_PASS = 0.7
THRESHOLD_TRAIN = 0.8
THUMBNAIL_SIZE = (64, 64)
EYES_OFFSET = (0.25, 0.25)
ANGLE_MAX = 30
SCALE_MIN = 64.0 / 368.0

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


def get_eye(eye_gray):
    """Eye Detection"""
    eyes = CLASSIFIER_EYE.detectMultiScale(
        eye_gray,
        scaleFactor=1.1,
        minNeighbors=2,
        flags=CASCADE_SCALE_IMAGE,
        minSize=(THUMBNAIL_SIZE[0] / 4, THUMBNAIL_SIZE[1] / 4)
    )
    if len(eyes) == 1:
        return (eyes[0][0] + eyes[0][2] / 2, eyes[0][1] + eyes[0][3] / 2)
    return None


def get_eyes(face_gray, width, height):
    """Eyes Detection"""
    eye_w = int(3 * width / 5.0)
    eye_h = int(3 * height / 5.0)
    left = get_eye(face_gray[0:eye_h, 0:eye_w])
    right = get_eye(face_gray[0:eye_h, width - eye_w:width])
    return left, (right[0] + width - eye_w, right[1]) if right else None


def get_distance((o_x, o_y), (d_x, d_y)):
    """Distance Between Two Points"""
    return sqrt((d_x - o_x)**2.0 + (d_y - o_y)**2.0)


def get_face_rotation(image, (o_x, o_y), (d_x, d_y), reference):
    """Scale, Rotate and Translate Image"""
    angle = degrees(atan2(d_y - o_y, d_x - o_x))
    scale = reference / get_distance((o_x, o_y), (d_x, d_y))
    matrix = getRotationMatrix2D((o_x, o_y), angle, scale)
    return warpAffine(image, matrix, image.shape, borderMode=BORDER_CONSTANT, borderValue=(127, 127, 127)), angle, scale


def get_face_transformation(image, (left_x, left_y), right, (offset_x, offset_y), (width, height)):
    """Scale, Rotate and Translate Image"""
    padding_x = float(offset_x * width)
    padding_y = float(offset_y * height)
    image, angle, scale = get_face_rotation(
        image, (left_x, left_y), right, width - 2.0 * padding_x)
    crop_x = int(left_x - padding_x)
    crop_y = int(left_y - padding_y)
    return image[crop_y:crop_y + height, crop_x:crop_x + width], angle, scale


def get_face(gray, (f_x, f_y, width, height)):
    """Face Detection"""
    face_gray = gray[f_y:f_y + height, f_x:f_x + width]
    left, right = get_eyes(face_gray, width, height)
    label = None
    confidence = 0
    image = None
    angle = 0
    scale = 1.0
    if left and right:
        thumbnail, angle, scale = get_face_transformation(
            face_gray, left, right, EYES_OFFSET, THUMBNAIL_SIZE)
        if left != right and abs(angle) < ANGLE_MAX and scale <= 1 and scale >= SCALE_MIN:
            if get_index() == 0:
                label, confidence = write_label(thumbnail)
            else:
                label, distance = RECOGNIZER.predict(thumbnail)
                confidence = round(1.0 - distance / 255.0, 2)
                if confidence <= THRESHOLD_CREATE:
                    label, confidence = write_label(thumbnail)
                elif confidence >= THRESHOLD_PASS and confidence <= THRESHOLD_TRAIN:
                    RECOGNIZER.update([thumbnail], array([label]))
                    RECOGNIZER.write(MODEL)
            _, image = imencode(
                ".jpg", thumbnail, (IMWRITE_JPEG_OPTIMIZE, True, IMWRITE_JPEG_QUALITY, 70))
            image = b64encode(image)
    return {
        "x": int(f_x),
        "y": int(f_y),
        "width": int(width),
        "height": int(height),
        "label": label,
        "confidence": confidence,
        "image": image,
        "angle": angle,
        "scale": scale,
        "eyes": {
            "left": {"x": left[0], "y": left[1]} if left else None,
            "right": {"x": right[0], "y": right[1]} if right else None
        }
    }


def detect(gray):
    """Face Detection"""
    detections = CLASSIFIER_FACE.detectMultiScale(
        gray,
        scaleFactor=1.3,
        minNeighbors=5,
        flags=CASCADE_SCALE_IMAGE,
        minSize=THUMBNAIL_SIZE
    )
    return [get_face(gray, d) for d in detections]
