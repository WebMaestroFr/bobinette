'''Vision Package'''
# pylint: disable=E0611,C0103

from math import sqrt

from cv2 import COLOR_BGR2LAB, createCLAHE, cvtColor, split

try:
    from picamera import array as camera_array
    from picamera import PiCamera
except ImportError:
    # Development and Continuous Integration
    from fake_rpi.picamera import array as camera_array
    from fake_rpi.picamera import PiCamera


print('=> INIT VISION')

RESOLUTION = (640, 480)
FRAMERATE = 8

CAMERA = PiCamera()
CAMERA.resolution = RESOLUTION
CAMERA.framerate = FRAMERATE
RGB = camera_array.PiRGBArray(CAMERA, size=RESOLUTION)

CLAHE = createCLAHE(clipLimit=4.0, tileGridSize=(8, 8))


def crop_image(image, x, y, width, height):
    '''Crop Image'''
    return image[y:y + height, x:x + width]


def get_distance(origin, destination):
    '''Distance Between Two Points'''
    (o_x, o_y) = origin
    (d_x, d_y) = destination
    return sqrt((d_x - o_x)**2.0 + (d_y - o_y)**2.0)


def get_gray(bgr):
    '''Apply Contrast Limited Adaptive Histogram Equalization'''
    lab = cvtColor(bgr, COLOR_BGR2LAB)
    lightness, __a, __b = split(lab)
    return CLAHE.apply(lightness)


def run_capture(callback):
    '''Run Camera Capture'''
    try:
        for frame in CAMERA.capture_continuous(RGB, format='bgr', use_video_port=True):
            callback(frame.array)
            RGB.truncate(0)
    finally:
        if CAMERA:
            CAMERA.close()
