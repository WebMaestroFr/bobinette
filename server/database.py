'''Server Database'''

from bobinette import DATA_PATH, NAME
from bobinette.server import app
from flask_sqlalchemy import SQLAlchemy

app.config[
    'SQLALCHEMY_DATABASE_URI'] = 'sqlite:///%s/%s.sqlite3' % (DATA_PATH, NAME)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


DB = SQLAlchemy(app)
