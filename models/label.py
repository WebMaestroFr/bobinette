"""Label Model"""
from cv2 import imdecode

from .. import DB as db
from .. import FACE_MODEL, FACE_RECOGNIZER


class Label(db.Model):
    """Label Model Class"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
