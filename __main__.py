'''Capture and Face Recognition'''

from json import dumps
from threading import Thread

import bobinette.vision.face as subject
from bobinette.models import Detection, Label, Region, Snapshot
from bobinette.models._base import ModelEncoder
from bobinette.server import app, db, socket, socket_action
from bobinette.vision import get_gray, run_capture
from cv2 import error as cv_error

HOST = 'bobinette-dev.local'


@socket.on('connect')
def client_connect():
    '''New Client Connection'''
    labels = Label.query.all()
    socket_action('SET_LABELS', labels)
    detections = Detection.query.all()
    socket_action('SET_DETECTIONS', detections)


@socket.on('UPDATE_LABEL_NAME')
def update_label_name(data):
    '''Update Label Name Event'''
    label = Label.query.get(data.id)
    label.name = data.name
    db.session.commit()


def handle_snapshot(frame):
    '''Handle Snapshot'''
    print '=> PROCESS SNAPSHOT'
    gray = get_gray(frame)

    snapshot = Snapshot(frame)
    snapshot.regions = [Region(*d) for d in subject.detect(gray)]
    print dumps(snapshot, cls=ModelEncoder)
    socket_action('SET_SNAPSHOT', snapshot, broadcast=True)

    detections = []
    labels = []

    for region in snapshot.regions:
        thumbnail = subject.transform(region, gray)
        if thumbnail:
            label_id, confidence = subject.predict(thumbnail)
            if confidence <= subject.THRESHOLD_CREATE:
                label = Label()
                labels.append(label)
                db.session.add(label)
                subject.train(label.id, thumbnail)
            else:
                label = Label.query.get(label_id)
                if subject.THRESHOLD_PASS >= confidence <= subject.THRESHOLD_TRAIN:
                    subject.train(label_id, thumbnail)
            detection = Detection(thumbnail, label, region)
            detections.append(detection)
            db.session.add(detection)

    if detections:
        db.session.commit()
        socket_action('ADD_DETECTIONS', detections, broadcast=True)
        if labels:
            socket_action('ADD_LABELS', labels, broadcast=True)

CAPTURE = Thread(target=run_capture, args=[handle_snapshot])


@app.before_first_request
def before_first_request():
    '''Before First Request'''
    print '=> START CAPTURE'
    CAPTURE.start()


if __name__ == '__main__':
    with app.app_context():
        print '=> CREATE DATABASE'
        db.create_all()
    print '=> RUN SERVER'
    socket.run(app, host=HOST, port=80, debug=False, log_output=True)
