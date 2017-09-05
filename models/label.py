"""Label Model"""
print "=> LABEL MODEL"

from bobinette.models._base import Model
from bobinette.server import db


class Label(Model, db.Model):
    """Label Model Class"""
    __tablename__ = 'label'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
