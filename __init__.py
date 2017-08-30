'''Constants and Singletons'''

from math import sqrt
from os import path

from flask import Flask

from cv2 import COLOR_BGR2LAB, createCLAHE, cvtColor, split
from flask_socketio import SocketIO, emit
from flask_sqlalchemy import SQLAlchemy
from picamera import array as camera_array
from picamera import PiCamera

from . import _face

ROOT_PATH = path.dirname(__file__)
DATA_PATH = path.realpath('%s/data' % (ROOT_PATH))
OPENCV_PATH = path.realpath('%s/libraries/opencv' % (ROOT_PATH))
APP_PATH = path.realpath('%s/application/build' % (ROOT_PATH))

APP = Flask(__name__, static_url_path='', static_folder=APP_PATH)
APP.config['SECRET_KEY'] = '5kjgn9RVXcoCmD3uwobyxPW9pUj9xi5X'
APP.config[
    'SQLALCHEMY_DATABASE_URI'] = 'sqlite:///%s/%s.sqlite3' % (DATA_PATH, 'faces')

DB = SQLAlchemy(APP)

SOCKET = SocketIO(APP)


CAMERA = PiCamera()
CAMERA.resolution = (480, 368)
CAMERA.framerate = 8
CAPTURE = camera_array.PiRGBArray(CAMERA, size=CAMERA.resolution)

CLAHE = createCLAHE(clipLimit=4.0, tileGridSize=(8, 8))

THUMBNAIL_SIZE = (64, 64)


def socket_action(action_type, data, **kwargs):
    '''Emit a Redux Action to be processed by Client'''
    emit('action', {
        'type': action_type,
        'data': data
    }, **kwargs)


def crop_image(image, x, y, width, height):
    '''Crop Image'''
    return image[y:y + height, x:x + width]


def get_distance((o_x, o_y), (d_x, d_y)):
    '''Distance Between Two Points'''
    return sqrt((d_x - o_x)**2.0 + (d_y - o_y)**2.0)


def get_gray(bgr):
    '''Contrast Limited Adaptive Histogram Equalization'''
    lab = cvtColor(bgr, COLOR_BGR2LAB)
    lightness, a, b = split(lab)
    return CLAHE.apply(lightness)
