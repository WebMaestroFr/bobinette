"""Capture and Face Recognition"""


from flask import render_template

from cv2 import error as cv_error

from . import APP as app
from . import DB as db
from . import SOCKET as socket
from . import _face as recognition
from . import CAMERA, CAPTURE, get_gray, socket_action
from .models import Detection, Face, Label, Snapshot


@app.route('/')
def main_controller():
    """Main Controller"""
    return render_template('application/build/index.html')


@socket.on('connect')
def client_connect():
    """New Client Connection"""
    labels = Label.query.all()
    socket_action('SET_LABELS', labels)
    faces = Face.query.all()
    socket_action('SET_FACES', faces)


@socket.on('UPDATE_LABEL_NAME')
def update_label_name(data):
    """Update Label Name Event"""
    label = Label.query.get(data.id)
    label.name = data.name
    db.session.commit()


def handle_snapshot(frame):
    """Handle Snapshot"""
    try:
        gray = get_gray(frame)

        snapshot = Snapshot(frame)
        snapshot.detections = [Detection(*d) for d in recognition.detect(gray)]

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
                    db.session.add(label)
                    recognition.train(label.id, thumbnail)
                else:
                    label = Label.query.get(label_id)
                    if recognition.THRESHOLD_PASS >= confidence <= recognition.THRESHOLD_TRAIN:
                        recognition.train(label_id, thumbnail)
                face = Face(thumbnail, label, detection)
                faces.append(face)
                db.session.add(face)

        if faces:
            db.session.commit()
            socket_action('ADD_FACES', faces, broadcast=True)
            if labels:
                socket_action('ADD_LABELS', labels, broadcast=True)

    except cv_error as error:
        print error
        socket_action('ALERT_ERROR', error, broadcast=True)


def capture():
    """Capture Snapshots"""
    try:
        for frame in CAMERA.capture_continuous(CAPTURE, format="bgr", use_video_port=True):
            handle_snapshot(frame.array)
            CAPTURE.truncate(0)
    finally:
        CAMERA.close()

if __name__ == "__main__":
    socket.run(app, port=80)
    capture()
