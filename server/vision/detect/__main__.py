"""Object Detection"""

from base64 import b64encode
from datetime import datetime
from json import dumps
from sys import argv, stderr, stdout

from cv2 import (COLOR_BGR2LAB, IMWRITE_JPEG_OPTIMIZE, IMWRITE_JPEG_QUALITY,
                 createCLAHE, cvtColor, error, imencode, split)
from picamera import PiCamera, array

RESOLUTION = (480, 368)
FRAMERATE = 8
JPEG_QUALITY = 70

CAMERA = PiCamera()
CAMERA.resolution = RESOLUTION
CAMERA.framerate = FRAMERATE
CAPTURE = array.PiRGBArray(CAMERA, size=RESOLUTION)

EPOCH = datetime.utcfromtimestamp(0)

CLAHE = createCLAHE(clipLimit=4.0, tileGridSize=(8, 8))


def equalize_gray(bgr):
    """Apply Contrast Limited Adaptive Histogram Equalization"""
    # return cvtColor(bgr, COLOR_BGR2GRAY)
    lab = cvtColor(bgr, COLOR_BGR2LAB)
    lightness, _a, _b = split(lab)
    return CLAHE.apply(lightness)


def b64_jpeg(bgr):
    """Encode JPEG"""
    _, jpeg = imencode(".jpg", bgr, (IMWRITE_JPEG_OPTIMIZE, True,
                                     IMWRITE_JPEG_QUALITY, JPEG_QUALITY))
    return b64encode(jpeg)


def detect(name):
    """Run Process"""
    subject = __import__("vision.detect.%s" % name)
    try:
        for frame in CAMERA.capture_continuous(CAPTURE, format="bgr", use_video_port=True):
            date = datetime.utcnow()
            try:
                gray = equalize_gray(frame.array)
                result = {
                    "date": int((date - EPOCH).total_seconds() * 1000.0),
                    "detections": subject.detect(gray),
                    "image": b64_jpeg(frame.array)
                }
                output = dumps(result)
            except error as cv_error:
                message = str(cv_error)
                stderr.write(message)
                stderr.flush()

            stdout.write(output)
            stdout.flush()

            CAPTURE.truncate(0)
    finally:
        CAMERA.close()

if __name__ == "__main__":
    detect(argv[1])
