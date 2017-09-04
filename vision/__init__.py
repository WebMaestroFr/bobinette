'''Vision Package'''
print "=> INIT VISION"

from math import sqrt

import bobinette.vision.face as Face
from cv2 import COLOR_BGR2LAB, createCLAHE, cvtColor, split
from picamera import array as camera_array
from picamera import PiCamera

RESOLUTION = (480, 368)
FRAMERATE = 8

CAMERA = PiCamera()
CAMERA.resolution = RESOLUTION
CAMERA.framerate = FRAMERATE
RGB = camera_array.PiRGBArray(CAMERA, size=RESOLUTION)

CLAHE = createCLAHE(clipLimit=4.0, tileGridSize=(8, 8))


def crop_image(image, x, y, width, height):
    '''Crop Image'''
    return image[y:y + height, x:x + width]


def get_distance((o_x, o_y), (d_x, d_y)):
    '''Distance Between Two Points'''
    return sqrt((d_x - o_x)**2.0 + (d_y - o_y)**2.0)


def get_gray(bgr):
    '''Apply Contrast Limited Adaptive Histogram Equalization'''
    lab = cvtColor(bgr, COLOR_BGR2LAB)
    lightness, a, b = split(lab)
    return CLAHE.apply(lightness)
