"""Capture and Face Recognition"""

from threading import Thread

from flask import render_template

from bobinette import _face as recognition
from bobinette import (SQL, create_app, create_camera, create_clahe, get_gray,
                       socket_action)
from bobinette.models import Detection, Face, Label, Snapshot
from cv2 import error as cv_error

APP, SOCKET = create_app('faces', '5kjgn9RVXcoCmD3uwobyxPW9pUj9xi5X')
CAMERA, CAPTURE = create_camera((480, 368), 8)
CLAHE = create_clahe(clipLimit=4.0, tileGridSize=(8, 8))


@APP.route('/')
def main_controller():
    """Main Controller"""
    return render_template('application/build/index.html')


@SOCKET.on('connect')
def client_connect():
    """New Client Connection"""
    labels = Label.query.all()
    socket_action('SET_LABELS', labels)
    faces = Face.query.all()
    socket_action('SET_FACES', faces)


@SOCKET.on('UPDATE_LABEL_NAME')
def update_label_name(data):
    """Update Label Name Event"""
    label = Label.query.get(data.id)
    label.name = data.name
    SQL.session.commit()


def handle_snapshot(frame):
    """Handle Snapshot"""
    try:
        gray = get_gray(frame, CLAHE)

        snapshot = Snapshot(frame)
        snapshot.detections = [Detection(*d)
                               for d in recognition.detect(gray)]

        print snapshot
        socket_action('SET_SNAPSHOT', snapshot, broadcast=True)

        faces = []
        labels = []

        for detection in snapshot.detections:
            thumbnail = recognition.transform(detection, gray)
            if thumbnail:
                label_id, confidence = recognition.predict(thumbnail)
                if confidence <= recognition.THRESHOLD_CREATE:
                    label = Label()
                    labels.append(label)
                    SQL.session.add(label)
                    recognition.train(label.id, thumbnail)
                else:
                    label = Label.query.get(label_id)
                    if recognition.THRESHOLD_PASS >= confidence <= recognition.THRESHOLD_TRAIN:
                        recognition.train(label_id, thumbnail)
                face = Face(thumbnail, label, detection)
                faces.append(face)
                SQL.session.add(face)

        if faces:
            SQL.session.commit()
            socket_action('ADD_FACES', faces, broadcast=True)
            if labels:
                socket_action('ADD_LABELS', labels, broadcast=True)

    except cv_error as error:
        print error
        socket_action('ALERT_ERROR', error, broadcast=True)


@APP.before_first_request
def activate_capture():
    """Activate Capture Snapshots"""
    print "=> STARTING CAPTURE"

    def run_capture():
        """Run Capture Snapshots"""
        try:
            for frame in CAMERA.capture_continuous(CAPTURE, format="bgr", use_video_port=True):
                print "=> FRAME"
                handle_snapshot(frame.array)
                CAPTURE.truncate(0)
        finally:
            CAMERA.close()
    Thread(target=run_capture).start()


if __name__ == "__main__":
    SQL.create_all()
    SOCKET.run(APP, port=80, debug=True)
