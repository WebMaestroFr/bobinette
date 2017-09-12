"""Label Model"""
print "=> LABEL MODEL"

from bobinette.models.detection import Detection
from bobinette.server import db

DETECTION_DATE_DESC = db.desc(Detection.snapshot_date)


class Label(db.Model):
    """Label Model Class"""
    __tablename__ = 'label'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String)

    _detections = db.relationship('Detection', backref=db.backref(
        '_label',
        uselist=False
    ))

    @property
    def detection(self):
        """Last Detection"""
        return db.session.query(Detection).filter(self.id == Detection.label_id).order_by(DETECTION_DATE_DESC).first()

    def __init__(self, name=''):
        self.name = name
