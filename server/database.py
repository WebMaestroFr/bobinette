'''Server Database'''
print "=> SERVER DATABASE"

from bobinette import NAME, PATH_DATA
from bobinette.server import app
from flask_sqlalchemy import SQLAlchemy

app.config[
    'SQLALCHEMY_DATABASE_URI'] = 'sqlite:///%s/%s.sqlite3' % (PATH_DATA, NAME)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


DB = SQLAlchemy(app)
