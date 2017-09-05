'''Server Application'''
print "=> SERVER APPLICATION"

from flask import Flask, render_template

from bobinette import NAME, PATH_APP, PATH_STATIC, SECRET

APP = Flask(
    NAME,
    static_folder=PATH_STATIC,
    template_folder=PATH_APP)
APP.config['SECRET_KEY'] = SECRET


@APP.route('/')
def main_controller():
    """Main Controller"""
    return render_template('index.html')
