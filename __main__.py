"""Capture and Face Recognition"""

from threading import Thread

from bobinette.models import Detection, Label, Region, Snapshot
from bobinette.server import app, db, socket, socket_action
from bobinette.vision import Face as subject
from bobinette.vision import CAMERA, RGB, get_gray
from cv2 import error as cv_error


@socket.on('connect')
def client_connect():
    """New Client Connection"""
    labels = Label.query.all()
    socket_action('SET_LABELS', labels)
    detections = Detection.query.all()
    socket_action('SET_DETECTIONS', detections)


@socket.on('UPDATE_LABEL_NAME')
def update_label_name(data):
    """Update Label Name Event"""
    label = Label.query.get(data.id)
    label.name = data.name
    db.session.commit()


def handle_snapshot(frame):
    """Handle Snapshot"""
    print "=> PROCESS SNAPSHOT"
    gray = get_gray(frame)

    snapshot = Snapshot(frame)
    snapshot.regions = [Region(*d) for d in subject.detect(gray)]

    print snapshot
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


def run_capture():
    """Run Flask Server"""
    try:
        for frame in CAMERA.capture_continuous(RGB, format="bgr", use_video_port=True):
            print "=> PROCESS FRAME"
            handle_snapshot(frame.array)
            RGB.truncate(0)
    except cv_error as error:
        print error
        socket_action('ALERT_ERROR', error, broadcast=True)
    except Exception as error:
        print error
    finally:
        CAMERA.close()


@app.before_first_request
def before_first_request():
    """Before First Request"""
    print "=> START CAPTURE"
    capture = Thread(target=run_capture)
    capture.start()


if __name__ == "__main__":
    with app.app_context():
        print "=> ACTIVATE DATABASE"
        db.create_all()
    print "=> START SERVER"
    socket.run(app, port=80, debug=False, log_output=True)
