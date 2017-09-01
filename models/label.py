"""Label Model"""
from bobinette import SQL
from cv2 import imdecode


class Label(SQL.Model):
    """Label Model Class"""
    __tablename__ = 'label'

    id = SQL.Column(SQL.Integer, primary_key=True)
    name = SQL.Column(SQL.String)
