'''Face Model'''

from bobinette import PNG_COMPRESSION, SQL
from cv2 import IMWRITE_PNG_COMPRESSION, imencode


class Face(SQL.Model):
    '''Face Model Class'''
    __tablename__ = 'face'

    id = SQL.Column(SQL.Integer, primary_key=True)

    date = SQL.Column(SQL.DateTime, SQL.ForeignKey('detection.date'))
    detection = SQL.relationship('Detection', backref=SQL.backref(
        'face',
        uselist=False
    ), uselist=False)
    thumbnail = SQL.Column(SQL.LargeBinary)
    label_id = SQL.Column(SQL.Integer, SQL.ForeignKey('label.id'))
    label = SQL.relationship('Label', backref='faces', uselist=False)

    def __init__(self, thumbnail, label=None, detection=None):
        _, self.thumbnail = imencode('.png', thumbnail, (
            IMWRITE_PNG_COMPRESSION, PNG_COMPRESSION))
        self.label = label
        self.detection = detection
