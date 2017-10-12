'''Server Package'''
print("=> INIT SERVER")

from datetime import datetime

from flask.json import JSONEncoder

import numpy
from bobinette.server.application import APP as app
from bobinette.server.database import DB as db
from bobinette.server.database import BaseModel as Model
from bobinette.server.socket import SOCKET as socket
from bobinette.server.socket import action

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
        if isinstance(obj, bytes):
            return obj.decode()
        if isinstance(obj, numpy.generic):
            return numpy.asscalar(obj)
        if isinstance(obj, numpy.ndarray):
            return obj.tolist()
        # print(type(obj))
        return JSONEncoder.default(self, obj)

app.json_encoder = ModelEncoder
