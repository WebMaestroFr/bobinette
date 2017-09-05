"""Base Model"""
print "=> BASE MODEL"

from base64 import b64encode
from datetime import datetime

from flask.json import JSONEncoder

from bobinette.server import app
from numpy import ndarray


class Model(object):
    """SQLAlchemy Base Model"""

    @property
    def __json__(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    def __repr__(self):
        return '{}({})'.format(self.__class__.__name__, self.__json__)


class ModelEncoder(JSONEncoder):
    """Encode SQLAlchemy Model"""

    def default(self, obj):
        """JSON Types"""
        if isinstance(obj, Model):
            return obj.__json__
        if isinstance(obj, datetime):
            return obj.isoformat()
        if isinstance(obj, ndarray):
            return b64encode(obj)
        return JSONEncoder.default(self, obj)

app.json_encoder = ModelEncoder
