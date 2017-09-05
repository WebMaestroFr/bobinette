"""Region Model"""
print "=> REGION MODEL"

from bobinette.models._base import Model
from bobinette.server import db


class Region(Model, db.Model):
    """Region Model Class"""
    __tablename__ = 'region'

    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime, db.ForeignKey('snapshot.date'))

    x = db.Column(db.Integer)
    y = db.Column(db.Integer)
    width = db.Column(db.Integer)
    height = db.Column(db.Integer)

    def __init__(self, x, y, width, height):
        self.x = x
        self.y = y
        self.width = width
        self.height = height
