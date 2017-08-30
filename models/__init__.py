"""Models"""

from .. import DB as db
from .detection import Detection
from .face import Face
from .label import Label
from .snapshot import Snapshot

db.create_all()
