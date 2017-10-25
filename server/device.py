'''Lock Device'''

from threading import Timer

try:
    from RPi import GPIO
except ImportError:
    # Development and Continuous Integration
    from fake_rpi.RPi import GPIO

GPIO.setmode(GPIO.BOARD)
GPIO.setwarnings(False)


class Lock(object):
    '''Safe Lock Controller'''

    is_open = False
    channel = 7
    timeout = 4.0

    @classmethod
    def close(cls):
        '''Safe Close'''
        if cls.is_open:
            print('=> \033[91mCLOSE_LOCK\033[0m')
            cls.is_open = False
            GPIO.output(cls.channel, 0)

    @classmethod
    def open(cls):
        '''Safe Open'''
        if not cls.is_open:
            print('=> \033[92mOPEN_LOCK\033[0m')
            cls.is_open = True
            GPIO.output(cls.channel, 1)
            close = Timer(cls.timeout, cls.close)
            close.start()

GPIO.setup(Lock.channel, GPIO.OUT, initial=Lock.is_open)
