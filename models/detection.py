'''Detection Model'''
print("=> DETECTION MODEL")

from base64 import b64decode, b64encode

from bobinette.server import db
from cv2 import IMWRITE_PNG_COMPRESSION, imdecode, imencode
from numpy import fromstring as numpy_fromstring
from numpy import uint8

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

    @property
    def _image(self):
        """Decoded Thumbnail"""
        source = b64decode(self.thumbnail)
        image = numpy_fromstring(source, dtype=uint8)
        return imdecode(image, 0)
