'''Detection Model'''
print "=> DETECTION MODEL"

from bobinette.server import db
from cv2 import IMWRITE_PNG_COMPRESSION, imencode

PNG_COMPRESSION = 9


class Detection(db.Model):
    '''Detection Model Class'''
    __tablename__ = 'detection'

    id = db.Column(db.Integer, primary_key=True)

    date = db.Column(db.DateTime, db.ForeignKey('region.date'))
    region = db.relationship('Region', backref=db.backref(
        'detection',
        uselist=False
    ), uselist=False)
    thumbnail = db.Column(db.LargeBinary)
    label_id = db.Column(db.Integer, db.ForeignKey('label.id'))
    label = db.relationship('Label', backref='detections', uselist=False)

    def __init__(self, thumbnail, label=None, region=None):
        _, self.thumbnail = imencode('.png', thumbnail, (
            IMWRITE_PNG_COMPRESSION, PNG_COMPRESSION))
        self.label = label
        self.region = region
