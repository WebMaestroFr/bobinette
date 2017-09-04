'''Server Socket'''

from bobinette.server import app
from flask_socketio import SocketIO, send

SOCKET = SocketIO(app)


def socket_action(action_type, data, **kwargs):
    '''Send a Redux Action to be processed by Client'''
    send({
        'type': action_type,
        'data': data
    }, json=True, **kwargs)
