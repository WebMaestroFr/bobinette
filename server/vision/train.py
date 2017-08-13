"""Object Detection"""

import sqlite3
from base64 import b64decode
from os import path
from sys import argv

from cv2 import face, imdecode
from numpy import array, fromstring, uint8

CURRENT_PATH = path.dirname(__file__)
DATA_PATH = path.realpath("%s/../../data" % (CURRENT_PATH))

RECOGNIZER = face.LBPHFaceRecognizer_create()

THRESHOLD_TRAIN = 0.67


def dict_factory(cursor, row):
    """Fetch Row as Dictionary"""
    return {column[0]: row[index] for index, column in enumerate(cursor.description)}


def get_db_cursor(name):
    """Get SQLite3 Connection Cursor"""
    db_connection = sqlite3.connect("%s/%s.sqlite3" % (DATA_PATH, name))
    db_connection.row_factory = dict_factory
    cursor = db_connection.cursor()
    return cursor


def get_labels(cursor):
    """Fetch Labels"""
    cursor.execute("SELECT * FROM labels")
    return cursor.fetchall()


def get_detections(cursor):
    """Fetch Detections"""
    cursor.execute("SELECT * FROM detections")
    return cursor.fetchall()


def decode_subject(image):
    """Decode Base64 Image"""
    data = b64decode(image)
    subject = fromstring(data, uint8)
    return imdecode(subject)


def set_indexes(cursor):
    """Save Indexes Map"""
    labels = get_labels(cursor)
    name_indexes = {}
    label_indexes = {}
    for label in labels:
        if label["name"] not in name_indexes:
            name_indexes[label["name"]] = len(labels) + len(name_indexes)
        label_indexes[label["id"]] = name_indexes[label["name"]]
    for index, name in name_indexes.iteritems():
        cursor.execute("INSERT INTO labels (id, name) VALUES ({index}, {name})".format(
            index=index, name=name))
    return label_indexes


def get_detection_sets(cursor, threshold=1.0):
    """Fetch and Split Detections Sets"""
    detections = get_detections(cursor)
    base_set = [detection for detection in detections if detection[
        "confidence"] == threshold]
    precision_set = [detection for detection in detections if detection[
        "confidence"] < threshold]
    return base_set, precision_set


def train(name):
    """Face Detection"""
    cursor = get_db_cursor(name)

    label_indexes = set_indexes(cursor)
    base_set, precision_set = get_detection_sets(cursor)

    for detection in base_set:
        subject = decode_subject(detection["image"])
        new_index = label_indexes[detection["label"]]
        RECOGNIZER.update([subject], array([new_index]))

    for detection in precision_set:
        subject = decode_subject(detection["image"])
        new_index = label_indexes[detection["label"]]
        index, distance = RECOGNIZER.predict(subject)
        confidence = round(1.0 - distance / 255.0, 2)
        if index != new_index or confidence < THRESHOLD_TRAIN:
            RECOGNIZER.update([subject], array([new_index]))

    model = "%s/%s.xml" % (DATA_PATH, name)
    RECOGNIZER.write(model)


if __name__ == "__main__":
    train(argv[1])
