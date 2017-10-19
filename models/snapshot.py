'''Snapshot Model'''
# pylint: disable=E0611,R0903

from base64 import b64encode
from datetime import datetime

from cv2 import IMWRITE_JPEG_OPTIMIZE, IMWRITE_JPEG_QUALITY, imencode, resize

from bobinette.server import db

print('=> SNAPSHOT MODEL')

JPEG_QUALITY = 70


class Snapshot(db.Model):
    '''Snapshot Model Class'''
    # pylint: disable=E1101
    __tablename__ = 'snapshot'

    date = db.Column(db.DateTime, primary_key=True)

    image = db.Column(db.Text)

    detections = db.relationship('Detection', backref=db.backref(
        '_snapshot',
        uselist=False
    ), lazy='joined')

    def __init__(self, bgr):
        self.date = datetime.utcnow()
        size = (int(bgr.shape[0] / 2), int(bgr.shape[1] / 2))
        source = resize(bgr, size)
        _, image = imencode('.jpg', source, (
            IMWRITE_JPEG_OPTIMIZE, True,
            IMWRITE_JPEG_QUALITY, JPEG_QUALITY))
        self.image = b64encode(image)
