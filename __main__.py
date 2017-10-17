'''Capture and Face Recognition'''
# pylint: disable=R0912

from threading import Timer

from bobinette.models import Detection, Label, Snapshot, compute_labels
from bobinette.server import action, app, db, socket
from bobinette.vision import face as subject
from bobinette.vision import get_gray, run_capture

try:
    from RPi import GPIO
except ImportError:
    # Development and Continuous Integration
    from fake_rpi.RPi import GPIO

print('\033[93mBobinette v0.1 - https://github.com/WebMaestroFr/bobinette\033[0m')

DOMAIN = 'bobinette-dev.local'
PORT = 80

LOCK_IS_OPEN = False
LOCK_CHANNEL = 7
LOCK_TIMEOUT = 4.0

APP_STATUS_CAPTURE = 'CAPTURE'
APP_STATUS_TRAIN = 'TRAIN'
APP_STATUS = APP_STATUS_CAPTURE

GPIO.setmode(GPIO.BOARD)
GPIO.setwarnings(False)
GPIO.setup(LOCK_CHANNEL, GPIO.OUT, initial=LOCK_IS_OPEN)


@socket.on('connect')
def client_connect():
    '''New Client Connection'''
    labels = Label.query.all()
    action('SET_LABELS', {
        'labels': labels
    })


@socket.on('UPDATE_LABEL_NAME')
def update_label_name(data):
    # pylint: disable=E1101
    '''Update Label Name Event'''
    print('=> \033[93mUPDATE_LABEL_NAME\033[0m')
    print(data)
    label = Label.query.get(data['id'])
    label.name = data['name']
    db.session.commit()


@socket.on('TRAIN_LABELS')
def train_labels(_=None):
    '''Train Labels Event'''
    # pylint: disable=W0603
    global APP_STATUS
    APP_STATUS = APP_STATUS_TRAIN
    print('=> \033[93mTRAIN_LABELS\033[0m')
    training_sets = compute_labels()
    subject.regenerate_recognizer(training_sets)
    APP_STATUS = APP_STATUS_CAPTURE
    return client_connect()


@socket.on('CLOSE_LOCK')
def close_lock(_=None):
    '''Close Lock Event'''
    # pylint: disable=W0603
    global LOCK_IS_OPEN
    if LOCK_IS_OPEN:
        print('=> \033[91mCLOSE_LOCK\033[0m')
        LOCK_IS_OPEN = False
        GPIO.output(LOCK_CHANNEL, 0)


@socket.on('OPEN_LOCK')
def open_lock(_=None):
    '''Open Lock Event'''
    # pylint: disable=W0603
    global LOCK_IS_OPEN
    if not LOCK_IS_OPEN:
        print('=> \033[92mOPEN_LOCK\033[0m')
        LOCK_IS_OPEN = True
        GPIO.output(LOCK_CHANNEL, 1)
        close = Timer(LOCK_TIMEOUT, close_lock)
        close.start()


def handle_snapshot(frame, snapshot):
    '''Handle Snapshot'''
    # pylint: disable=E1101,W0212
    labels = []
    gray = get_gray(frame)
    # Detect Faces
    regions = subject.detect(gray)
    if regions:
        # Save Snapshot if Faces detected
        db.session.add(snapshot)
        for region in regions:
            thumbnail = subject.transform(region, gray)
            # Attempt thumbnail transformation to confirm Face
            if thumbnail is not None:
                label_id, confidence = subject.predict(thumbnail)
                print('=> \033[93mDETECTION : %s\033[0m %s' %
                      (label_id, confidence))
                # Analyse prediction confidence
                if confidence <= subject.THRESHOLD_CREATE:
                    # If no match over "create" threshold and
                    # detectable thumbnail : create Label
                    if subject.detect(thumbnail, min_neighbors=1):
                        label = Label()
                        db.session.add(label)
                        labels.append((label, thumbnail))
                    else:
                        continue
                else:
                    label = Label.query.get(label_id)
                    # Handle predicted Label
                    if label.name == 'Etienne':
                        open_lock()
                    if subject.THRESHOLD_PASS >= confidence <= subject.THRESHOLD_TRAIN:
                        # Train if confidence within range
                        subject.train(label_id, thumbnail)
                # Create Detection
                detection = Detection(region, thumbnail)
                db.session.add(detection)
                # Set Detection relationships
                snapshot.detections.append(detection)
                label._detections.append(detection)

        if not snapshot.detections:
            db.session.expunge(snapshot)
        else:
            db.session.commit()
            if labels:
                # Broadcast and train new Labels
                action('ADD_LABELS', {
                    'labels': [l for (l, _) in labels]
                }, broadcast=True)
                for (label, thumbnail) in labels:
                    subject.train(label.id, thumbnail)


def handle_frame(frame):
    '''Handle Frame'''
    with app.app_context():
        snapshot = Snapshot(frame)
        if APP_STATUS == APP_STATUS_CAPTURE:
            handle_snapshot(frame, snapshot)
        action('SET_SNAPSHOT', {'snapshot': snapshot}, broadcast=True)


@app.before_first_request
def before_first_request():
    '''Before First Request'''
    print('=> START CAPTURE')
    socket.start_background_task(target=run_capture, callback=handle_frame)


if __name__ == '__main__':
    with app.app_context():
        print('=> CREATE DATABASE')
        db.create_all()
    print('=> RUN SERVER')
    socket.run(app, host=DOMAIN, port=PORT, debug=False, log_output=True)
