"""Label Model"""
print("=> LABEL MODEL")

from itertools import groupby

from bobinette.models.detection import Detection
from bobinette.server import db

DETECTION_DATE_DESC = db.desc(Detection.snapshot_date)
LABEL_NAME_DESC = db.desc(Label.name)


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
        return db.session.query(Detection).filter(
            self.id == Detection.label_id
        ).order_by(DETECTION_DATE_DESC).first()

    def __init__(self, name=''):
        self.name = name


def merge_labels(name, group):
    '''Merge Labels'''
    destination = Label(name=name)
    for label in group:
        destination._detections.extend(label._detections)
        db.session.delete(label)
    db.session.add(destination)
    return destination


def compute_labels():
    '''Group Labels Thumbnails'''
    sources = Label.query.order_by(LABEL_NAME_DESC).all()
    labels = []
    for (name, group) in groupby(sources, lambda l: l.name):
        group = list(group)
        if name == '':
            labels.extend(group)
        else:
            label = merge_labels(name, group)
            labels.append(label)
    db.session.commit()
    return [(l.id, [d._image for d in l._detections]) for l in labels]
