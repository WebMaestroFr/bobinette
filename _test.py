'''Pytest'''
import sys

import fake_rpi

sys.modules['RPi'] = fake_rpi.RPi
sys.modules['picamera'] = fake_rpi.picamera


def test_opencv_3():
    '''OpenCV Version 3'''
    import cv2
    assert cv2.__version__.startswith('3.')


def test_db_create_all():
    '''Database Creation'''
    from bobinette.__main__ import app, db
    with app.app_context():
        db.create_all()
