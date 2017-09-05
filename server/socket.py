'''Server Socket'''
print "=> SERVER SOCKET"

from flask import json

from bobinette.server import app
from flask_socketio import SocketIO

SOCKET = SocketIO(app, async_mode='threading', json=json)


def socket_action(action_type, data, **kwargs):
    '''Send a Redux Action to be processed by Client'''
    SOCKET.send({
        'type': action_type,
        'data': data
    }, json=True, **kwargs)
