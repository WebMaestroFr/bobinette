'''Constants and Singletons'''

from math import sqrt
from os import path

from flask import Flask

from cv2 import COLOR_BGR2LAB, createCLAHE, cvtColor, split
from flask_socketio import SocketIO, emit
from flask_sqlalchemy import SQLAlchemy
from picamera import array as camera_array
from picamera import PiCamera

ROOT_PATH = path.dirname(__file__)
DATA_PATH = path.realpath('%s/data' % (ROOT_PATH))
OPENCV_PATH = path.realpath('%s/libraries/opencv' % (ROOT_PATH))
APP_PATH = path.realpath('%s/application/build' % (ROOT_PATH))

THUMBNAIL_SIZE = (64, 64)
PNG_COMPRESSION = 9
JPEG_QUALITY = 70

SQL = SQLAlchemy()


def create_app(name, secret):
    '''Instanciate Flask, SQLAlchemy and SocketIO'''
    app = Flask(__name__, static_url_path='', static_folder=APP_PATH)
    app.config['SECRET_KEY'] = secret
    app.config[
        'SQLALCHEMY_DATABASE_URI'] = 'sqlite:///%s/%s.sqlite3' % (DATA_PATH, name)
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    SQL.init_app(app)
    socket = SocketIO(app)
    return app, socket


def create_camera(resolution, framerate):
    '''Instanciate PiCamera and PiRGBArray'''
    camera = PiCamera()
    camera.resolution = resolution
    camera.framerate = framerate
    capture = camera_array.PiRGBArray(camera, size=resolution)
    return camera, capture


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


def create_clahe(**kwargs):
    '''Create Contrast Limited Adaptive Histogram Equalization'''
    return createCLAHE(**kwargs)


def get_gray(bgr, clahe):
    '''Apply Contrast Limited Adaptive Histogram Equalization'''
    lab = cvtColor(bgr, COLOR_BGR2LAB)
    lightness, a, b = split(lab)
    return clahe.apply(lightness)
