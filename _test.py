'''Pytest'''
import sys

import cv2
import fake_rpi
from bobinette.__main__ import app, db

sys.modules['RPi'] = fake_rpi.RPi
sys.modules['picamera'] = fake_rpi.picamera


def test_opencv_3():
    '''OpenCV Version 3'''
    assert cv2.__version__.startswith('3.')


def test_db_create_all():
    '''Database Creation'''
    with app.app_context():
        db.create_all()
