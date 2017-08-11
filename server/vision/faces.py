"""Object Detection"""

from base64 import b64encode
from math import atan2, degrees, sqrt
from os import path
from sys import stderr

from cv2 import (BORDER_CONSTANT, CASCADE_SCALE_IMAGE, IMWRITE_PNG_COMPRESSION,
                 CascadeClassifier, face, getRotationMatrix2D, imencode,
                 warpAffine)
from numpy import array

THRESHOLD_CREATE = 0.6
THRESHOLD_PASS = 0.6
THRESHOLD_TRAIN = 0.67
SUBJECT_SIZE = (64, 64)
SUBJECT_OFFSET = (0.3, 0.4)
# THUMBNAIL_OFFSET = (0.3, 0.4)

PNG_COMPRESSION = 9
# JPEG_QUALITY = 70
BACKGROUND_COLOR = (127, 127, 127)

SUBJECT_PADDING = (
    SUBJECT_OFFSET[0] * SUBJECT_SIZE[0],
    SUBJECT_OFFSET[1] * SUBJECT_SIZE[1]
)
SUBJECT_DISTANCE = SUBJECT_SIZE[0] - 2 * SUBJECT_PADDING[0]
# THUMBNAIL_PADDING = (
#     THUMBNAIL_OFFSET[0] * SUBJECT_SIZE[0],
#     THUMBNAIL_OFFSET[1] * SUBJECT_SIZE[1]
# )
# THUMBNAIL_DISTANCE = THUMBNAIL_SIZE[0] - 2 * THUMBNAIL_PADDING[0]

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


def get_distance((o_x, o_y), (d_x, d_y)):
    """Distance Between Two Points"""
    return sqrt((d_x - o_x)**2.0 + (d_y - o_y)**2.0)


def crop_image(image, (x, y, width, height)):
    """Crop Image"""
    return image[y:y + height, x:x + width]


def detect_eye(eye_gray, offset=(0, 0)):
    """Center Point of Eye Detection"""
    eyes = CLASSIFIER_EYE.detectMultiScale(
        eye_gray,
        scaleFactor=1.1,
        minNeighbors=4,
        flags=CASCADE_SCALE_IMAGE,
        minSize=(
            int(eye_gray.shape[0] * 0.4),
            int(eye_gray.shape[1] * 0.4)
        ),
        maxSize=(
            int(eye_gray.shape[0] * 0.8),
            int(eye_gray.shape[1] * 0.8)
        )
    )
    if len(eyes) == 1:
        return (
            eyes[0][0] + eyes[0][2] / 2 + offset[0],
            eyes[0][1] + eyes[0][3] / 2 + offset[1]
        )
    if len(eyes) > 1:
        stderr.write("Found too many eyes !")
        stderr.flush()
    return None


def get_eyes(face_gray, offset=(0, 0)):
    """Eyes Detection"""
    search_left_x = 0.05 * face_gray.shape[0]
    search_right_x = 0.45 * face_gray.shape[0]
    search_y = 0.15 * face_gray.shape[1]
    search_width = 0.5 * face_gray.shape[0]
    search_height = 0.5 * face_gray.shape[1]
    left_gray = crop_image(
        face_gray, (search_left_x, search_y, search_width, search_height))
    right_gray = crop_image(
        face_gray, (search_right_x, search_y, search_width, search_height))
    left = detect_eye(
        left_gray, (offset[0] + search_left_x, offset[1] + search_y))
    right = detect_eye(
        right_gray, (offset[0] + search_right_x, offset[1] + search_y))
    return left, right


def get_face_transformation(left, right, distance=SUBJECT_DISTANCE):
    """Scale, Rotate and Translate"""
    angle = degrees(atan2(right[1] - left[1], right[0] - left[0]))
    scale = distance / get_distance(left, right)
    return angle, scale


def get_face_thumbnail(gray, left, angle, scale, padding=SUBJECT_PADDING):
    matrix = getRotationMatrix2D(left, angle, scale)
    image = warpAffine(gray, matrix, gray.shape,
                       borderMode=BORDER_CONSTANT,
                       borderValue=BACKGROUND_COLOR)
    return crop_image(image, (
        int(left[0] - padding[0]),
        int(left[1] - padding[1]),
        SUBJECT_SIZE[0],
        SUBJECT_SIZE[1]
    ))


def get_face(gray, (f_x, f_y, width, height)):
    """Face Detection"""
    face_gray = gray[f_y:f_y + height, f_x:f_x + width]
    left, right = get_eyes(face_gray, (f_x, f_y))
    label = None
    confidence = 0
    image = None
    angle = 0
    scale = 1.0
    if left and right:
        angle, scale = get_face_transformation(left, right)
        subject = get_face_thumbnail(gray, left, angle, scale)
        if left != right:
            if get_index() == 0:
                label, confidence = write_label(subject)
            else:
                label, distance = RECOGNIZER.predict(subject)
                confidence = round(1.0 - distance / 255.0, 2)
                if confidence <= THRESHOLD_CREATE:
                    stderr.write(
                        "Prediction confidence below threshold !\n\t%s => %s" % (
                            label, confidence))
                    stderr.flush()
                    label, confidence = write_label(subject)
                elif confidence >= THRESHOLD_PASS and confidence <= THRESHOLD_TRAIN:
                    RECOGNIZER.update([subject], array([label]))
                    RECOGNIZER.write(MODEL)
            # t_angle, t_scale = get_face_transformation(left, right, THUMBNAIL_DISTANCE)
            # thumbnail = get_face_thumbnail(gray, left, t_angle, t_scale, THUMBNAIL_PADDING)
            # _, image = imencode(".jpg", thumbnail, (
            #     IMWRITE_JPEG_OPTIMIZE, True,
            #     IMWRITE_JPEG_QUALITY, JPEG_QUALITY
            # ))
            _, image = imencode(".png", subject, (
                IMWRITE_PNG_COMPRESSION, PNG_COMPRESSION
            ))
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
        minNeighbors=4,
        flags=CASCADE_SCALE_IMAGE,
        minSize=SUBJECT_SIZE
    )
    return [get_face(gray, d) for d in detections]
