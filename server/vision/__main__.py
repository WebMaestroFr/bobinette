"""Object Detection"""

from base64 import b64encode
from datetime import datetime
from json import dumps
from sys import argv, stdout

from cv2 import (IMWRITE_JPEG_OPTIMIZE, IMWRITE_JPEG_QUALITY,  # createCLAHE,
                 imencode)
from picamera import PiCamera, array

RESOLUTION = (480, 368)
FRAMERATE = 4
JPEG_QUALITY = 70

CAMERA = PiCamera()
CAMERA.resolution = RESOLUTION
CAMERA.framerate = FRAMERATE
CAPTURE = array.PiRGBArray(CAMERA, size=RESOLUTION)

EPOCH = datetime.utcfromtimestamp(0)

# CLAHE = createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))


def main(name):
    """Run Process"""
    subject = __import__(name)
    try:
        for frame in CAMERA.capture_continuous(CAPTURE, format="bgr", use_video_port=True):
            date = datetime.utcnow()
            # source = CLAHE.apply(frame.array)
            _, image = imencode(".jpg", frame.array,
                                (IMWRITE_JPEG_OPTIMIZE, True,
                                 IMWRITE_JPEG_QUALITY, JPEG_QUALITY))
            result = {
                "date": int((date - EPOCH).total_seconds() * 1000.0),
                "detections": subject.detect(frame.array),
                "image": b64encode(image)
            }
            output = dumps(result)

            stdout.write(output)
            stdout.flush()

            CAPTURE.truncate(0)
    finally:
        CAMERA.close()

if __name__ == "__main__":
    main(argv[1])
