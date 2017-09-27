'''Pytest'''
import cv2


def test_opencv_3():
    '''OpenCV Version 3'''
    assert cv2.__version__.startswith('3.')
