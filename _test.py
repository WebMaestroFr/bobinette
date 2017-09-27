'''Pytest'''
import sys

import cv2
import fake_rpi

sys.modules['RPi'] = fake_rpi.RPi
sys.modules['picamera'] = fake_rpi.picamera


def test_opencv_3():
    '''OpenCV Version 3'''
    assert cv2.__version__.startswith('3.')
