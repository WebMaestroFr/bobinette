'''Server Package'''
print "=> INIT SERVER"

from bobinette.server.application import APP as app
from bobinette.server.database import DB as db
from bobinette.server.socket import SOCKET as socket
from bobinette.server.socket import socket_action
