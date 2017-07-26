"""Object Detection"""

from base64 import b64encode
from datetime import datetime
from json import dumps
from sys import argv, stdout

from cv2 import (COLOR_BGR2LAB, COLOR_LAB2BGR, IMWRITE_JPEG_OPTIMIZE,
                 IMWRITE_JPEG_QUALITY, createCLAHE, cvtColor, imencode, merge,
                 split)
from picamera import PiCamera, array

RESOLUTION = (480, 368)
FRAMERATE = 4
JPEG_QUALITY = 70

CAMERA = PiCamera()
CAMERA.resolution = RESOLUTION
CAMERA.framerate = FRAMERATE
CAPTURE = array.PiRGBArray(CAMERA, size=RESOLUTION)

EPOCH = datetime.utcfromtimestamp(0)

CLAHE = createCLAHE(clipLimit=8.0, tileGridSize=(16, 16))


def correct_bgr(bgr):
    """Apply Contrast Limited Adaptive Histogram Equalization"""
    lab = cvtColor(bgr, COLOR_BGR2LAB)
    lightness, green_red, blue_yellow = split(lab)
    correct = CLAHE.apply(lightness)
    image = merge((correct, green_red, blue_yellow))
    bgr = cvtColor(image, COLOR_LAB2BGR)
    _, jpeg = imencode(".jpg", bgr, (IMWRITE_JPEG_OPTIMIZE, True,
                                     IMWRITE_JPEG_QUALITY, JPEG_QUALITY))
    return bgr, b64encode(jpeg)


def main(name):
    """Run Process"""
    subject = __import__(name)
    try:
        for frame in CAMERA.capture_continuous(CAPTURE, format="bgr", use_video_port=True):
            date = datetime.utcnow()
            bgr, b64_jpeg = correct_bgr(frame.array)
            result = {
                "date": int((date - EPOCH).total_seconds() * 1000.0),
                "detections": subject.detect(bgr),
                "image": b64_jpeg
            }
            output = dumps(result)

            stdout.write(output)
            stdout.flush()

            CAPTURE.truncate(0)
    finally:
        CAMERA.close()

if __name__ == "__main__":
    main(argv[1])
