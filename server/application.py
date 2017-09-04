'''Server Application'''

from flask import Flask, render_template

from bobinette import NAME, PATH_APP, SECRET

APP = Flask(NAME, static_url_path='', static_folder=PATH_APP)
APP.config['SECRET_KEY'] = SECRET


@APP.route('/')
def main_controller():
    """Main Controller"""
    return render_template('%s/index.html' % PATH_APP)
