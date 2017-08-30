'''Snapshot Model'''

from datetime import datetime

from cv2 import (IMWRITE_JPEG_OPTIMIZE, IMWRITE_JPEG_QUALITY, JPEG_QUALITY,
                 imencode)

from .. import DB as db


class Snapshot(db.Model):
    '''Snapshot Model Class'''
    date = db.Column(db.DateTime, primary_key=True)
    image = db.Column(db.LargeBinary)
    detections = db.relationship('Detection', backref=db.backref(
        'snapshot',
        uselist=False
    ), lazy='joined')

    def __init__(self, bgr):
        self.date = datetime.utcnow()
        _, self.image = imencode('.jpg', bgr, (
            IMWRITE_JPEG_OPTIMIZE, True,
            IMWRITE_JPEG_QUALITY, JPEG_QUALITY))
