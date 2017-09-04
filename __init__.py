'''Constants and Singletons'''
print "=> INIT BOBINETTE"

from os import path

NAME = 'face-v1'
SECRET = '5kjgn9RVXcoCmD3uwobyxPW9pUj9xi5X'

PATH_ROOT = path.dirname(__file__)
PATH_DATA = path.realpath('%s/data' % (PATH_ROOT))
PATH_OPENCV = path.realpath('%s/libraries/opencv' % (PATH_ROOT))
PATH_APP = path.realpath('%s/application/build' % (PATH_ROOT))
