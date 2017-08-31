"""Label Model"""
from cv2 import imdecode

from .. import DB as db


class Label(db.Model):
    """Label Model Class"""
    __tablename__ = 'label'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
