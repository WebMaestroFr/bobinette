"""Models Package"""
print("=> INIT MODELS")

from bobinette.models.detection import Detection
from bobinette.models.label import Label, compute_labels, merge_labels
from bobinette.models.snapshot import Snapshot
