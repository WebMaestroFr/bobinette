'''Snapshot Model'''

from datetime import datetime

from bobinette import JPEG_QUALITY, SQL
from cv2 import IMWRITE_JPEG_OPTIMIZE, IMWRITE_JPEG_QUALITY, imencode


class Snapshot(SQL.Model):
    '''Snapshot Model Class'''
    __tablename__ = 'snapshot'

    date = SQL.Column(SQL.DateTime, primary_key=True)
    image = SQL.Column(SQL.LargeBinary)
    detections = SQL.relationship('Detection', backref=SQL.backref(
        'snapshot',
        uselist=False
    ), lazy='joined')

    def __init__(self, bgr):
        self.date = datetime.utcnow()
        _, self.image = imencode('.jpg', bgr, (
            IMWRITE_JPEG_OPTIMIZE, True,
            IMWRITE_JPEG_QUALITY, JPEG_QUALITY))
