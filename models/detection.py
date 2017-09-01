"""Detection Model"""
from bobinette import SQL


class Detection(SQL.Model):
    """Detection Model Class"""
    __tablename__ = 'detection'

    id = SQL.Column(SQL.Integer, primary_key=True)
    date = SQL.Column(SQL.DateTime, SQL.ForeignKey('snapshot.date'))

    x = SQL.Column(SQL.Integer)
    y = SQL.Column(SQL.Integer)
    width = SQL.Column(SQL.Integer)
    height = SQL.Column(SQL.Integer)

    def __init__(self, x, y, width, height):
        self.x = x
        self.y = y
        self.width = width
        self.height = height
