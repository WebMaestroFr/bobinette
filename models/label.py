'''Label Model'''
# pylint: disable=E1101,R0903

from bobinette.models.detection import Detection
from bobinette.server import db

print('=> LABEL MODEL')

DETECTION_DATE_DESC = db.desc(Detection.snapshot_date)


class Label(db.Model):
    '''Label Model Class'''
    # pylint: disable=C0103
    __tablename__ = 'label'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    access = db.Column(db.Boolean, default=False)
    name = db.Column(db.String)

    _detections = db.relationship('Detection', backref=db.backref(
        '_label',
        uselist=False
    ))

    def add_detections(self, detections):
        '''Add Detections'''
        self._detections.extend(detections)

    def get_detections(self):
        '''Add Detections'''
        return self._detections

    @property
    def detection(self):
        '''Last Detection'''
        return db.session.query(Detection).filter(
            self.id == Detection.label_id
        ).order_by(DETECTION_DATE_DESC).first()

    def merge(self):
        '''Merge Homonyms'''
        for homonym in self.__class__.query.filter(
                self.__class__.id != self.id,
                self.__class__.name == self.name).all():
            detections = homonym.get_detections()
            self._detections.extend(detections)
            db.session.delete(homonym)
        db.session.commit()

    @classmethod
    def get_training_sets(cls):
        '''Get Training Sets'''
        labels = cls.query.all()
        return [(l.id, [d.get_image() for d in l.get_detections()]) for l in labels]

    def __init__(self, name=''):
        self.name = name
