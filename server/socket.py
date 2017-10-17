'''Server Socket'''

from flask import json
from flask_socketio import SocketIO

from bobinette.server import app

print('=> SERVER SOCKET')

SOCKET = SocketIO(app, async_mode='threading', json=json)


def action(action_type, data, **kwargs):
    '''Send a Redux Action to be processed by Client'''
    print('=> \033[94m%s\033[0m' % action_type)
    print(data)
    data['type'] = action_type
    SOCKET.send(data, json=True, **kwargs)


@SOCKET.on_error_default
def default_error_handler(*args):
    '''Default Error Handler'''
    print('=> \033[91mSOCKET ERROR\033[0m')
    print(list(args))
