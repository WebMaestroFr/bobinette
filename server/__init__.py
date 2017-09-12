'''Server Package'''
print "=> INIT SERVER"

from datetime import datetime

from flask.json import JSONEncoder

from bobinette.server.application import APP as app
from bobinette.server.database import DB as db
from bobinette.server.database import BaseModel as Model
from bobinette.server.socket import SOCKET as socket
from bobinette.server.socket import action
from numpy import ndarray

EPOCH = datetime.utcfromtimestamp(0)


class ModelEncoder(JSONEncoder):
    """JSON Encoder"""

    def default(self, obj):
        """Encode SQLAlchemy Model and Columns"""
        if isinstance(obj, Model):
            return obj.__data__
        if isinstance(obj, datetime):
            total_seconds = (obj - EPOCH).total_seconds()
            return int(total_seconds * 1000.0)
        return JSONEncoder.default(self, obj)

app.json_encoder = ModelEncoder
