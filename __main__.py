'''Capture and Face Recognition'''
print "=> START BOBINETTE"

from bobinette.models import Detection, Label, Snapshot
from bobinette.server import action, app, db, socket
from bobinette.vision import face as subject
from bobinette.vision import get_gray, run_capture

DOMAIN = 'bobinette-dev.local'
PORT = 80


@socket.on('connect')
def client_connect():
    '''New Client Connection'''
    action('SET_LABELS', {'labels': Label.query.all()})


@socket.on('UPDATE_LABEL_NAME')
def update_label_name(data):
    '''Update Label Name Event'''
    print "=> UPDATE_LABEL_NAME", data
    label = Label.query.get(data['id'])
    label.name = data['name']
    db.session.commit()


def handle_snapshot(frame):
    '''Handle Snapshot'''
    gray = get_gray(frame)

    regions = [{'x': d[0], 'y': d[1], 'width': d[2], 'height': d[3]}
               for d in subject.detect(gray)]

    labels = []

    with app.app_context():

        snapshot = Snapshot(frame)
        db.session.add(snapshot)

        for region in regions:
            thumbnail = subject.transform(region, gray)
            if thumbnail is not None:

                label_id, confidence = subject.predict(thumbnail)
                if confidence <= subject.THRESHOLD_CREATE:
                    label = Label()
                    db.session.add(label)
                    labels.append(label)
                else:
                    label = Label.query.get(label_id)
                    if subject.THRESHOLD_PASS >= confidence <= subject.THRESHOLD_TRAIN:
                        subject.train(label_id, thumbnail)

                detection = Detection(region, thumbnail)
                db.session.add(detection)
                snapshot.detections.append(detection)
                label._detections.append(detection)

        db.session.commit()

        if labels:
            action('ADD_LABELS', {'labels': labels}, broadcast=True)
            for label in labels:
                subject.train(label.id, thumbnail)

        action('SET_SNAPSHOT', {'snapshot': snapshot}, broadcast=True)

        if not snapshot.detections:
            db.session.delete(snapshot)
            db.session.commit()


@app.before_first_request
def before_first_request():
    '''Before First Request'''
    print '=> START CAPTURE'
    socket.start_background_task(target=run_capture, callback=handle_snapshot)


if __name__ == '__main__':
    with app.app_context():
        print '=> CREATE DATABASE'
        db.create_all()
    print '=> RUN SERVER'
    socket.run(app, host=DOMAIN, port=PORT, debug=False, log_output=True)
