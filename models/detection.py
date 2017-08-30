"""Detection Model"""
from .. import DB as db


class Detection(db.Model):
    """Detection Model Class"""
    x = db.Column(db.Integer)
    y = db.Column(db.Integer)
    width = db.Column(db.Integer)
    height = db.Column(db.Integer)

    def __init__(self, x, y, width, height):
        self.x = x
        self.y = y
        self.width = width
        self.height = height
