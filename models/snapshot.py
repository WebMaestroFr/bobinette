'''Snapshot Model'''
print "=> SNAPSHOT MODEL"

from datetime import datetime

from bobinette.server import db
from cv2 import IMWRITE_JPEG_OPTIMIZE, IMWRITE_JPEG_QUALITY, imencode

JPEG_QUALITY = 70


class Snapshot(db.Model):
    '''Snapshot Model Class'''
    __tablename__ = 'snapshot'

    date = db.Column(db.DateTime, primary_key=True)
    image = db.Column(db.LargeBinary)
    regions = db.relationship('Region', backref=db.backref(
        'snapshot',
        uselist=False
    ), lazy='joined')

    def __init__(self, bgr):
        self.date = datetime.utcnow()
        _, self.image = imencode('.jpg', bgr, (
            IMWRITE_JPEG_OPTIMIZE, True,
            IMWRITE_JPEG_QUALITY, JPEG_QUALITY))
