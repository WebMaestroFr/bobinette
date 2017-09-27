'''Detection Model'''
print("=> DETECTION MODEL")

from base64 import b64encode

from bobinette.server import db
from cv2 import IMWRITE_PNG_COMPRESSION, imencode

PNG_COMPRESSION = 9


class Detection(db.Model):
    '''Detection Model Class'''
    __tablename__ = 'detection'

    id = db.Column(db.Integer, primary_key=True)
    region = db.Column(db.PickleType)
    thumbnail = db.Column(db.Text)

    label_id = db.Column(db.Integer, db.ForeignKey('label.id'))
    snapshot_date = db.Column(db.DateTime, db.ForeignKey('snapshot.date'))

    def __init__(self, region, thumbnail):
        self.region = region
        _, image = imencode('.png', thumbnail, (
            IMWRITE_PNG_COMPRESSION, PNG_COMPRESSION))
        self.thumbnail = b64encode(image)
