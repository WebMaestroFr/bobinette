'''Face Model'''

from cv2 import IMWRITE_PNG_COMPRESSION, PNG_COMPRESSION, imencode

from .. import DB as db


class Face(db.Model):
    '''Face Model Class'''
    date = db.Column(db.DateTime, db.ForeignKey('detection.snapshot.date'))
    detection = db.relationship('Detection', backref=db.backref(
        'face',
        uselist=False
    ), uselist=False)
    thumbnail = db.Column(db.LargeBinary)
    label_id = db.Column(db.Integer, db.ForeignKey('label.id'))
    label = db.relationship('Label', backref='faces', uselist=False)

    def __init__(self, thumbnail, label=None, detection=None):
        _, self.thumbnail = imencode('.png', thumbnail, (
            IMWRITE_PNG_COMPRESSION, PNG_COMPRESSION))
        self.label = label
        self.detection = detection
