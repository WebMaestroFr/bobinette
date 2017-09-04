"""Label Model"""
print "=> LABEL MODEL"

from bobinette.server import db


class Label(db.Model):
    """Label Model Class"""
    __tablename__ = 'label'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
