'''Server Database'''
print('=> SERVER DATABASE')

from bobinette import NAME, PATH_DATA
from bobinette.server import app
from flask_sqlalchemy import Model, SQLAlchemy
from sqlalchemy.inspection import inspect

EXCLUDE = ['metadata', 'query', 'query_class']


class BaseModel(Model):
    '''SQLAlchemy Base Model'''

    @property
    def __data__(self):
        return {attribute: self.__getattribute__(attribute)
                for attribute in dir(self)
                if not attribute.startswith('_') and attribute not in EXCLUDE}

    @property
    def __keys__(self):
        return {key.name: self.__getattribute__(key.name)
                for key in inspect(self.__class__).primary_key}

    def __repr__(self):
        return '\033[1m{}\033[0m({})'.format(self.__class__.__name__, self.__keys__)


app.config[
    'SQLALCHEMY_DATABASE_URI'] = 'sqlite:///%s/%s.sqlite3' % (PATH_DATA, NAME)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


DB = SQLAlchemy(app, model_class=BaseModel, session_options={
    'expire_on_commit': False
})
