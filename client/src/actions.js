import {serverAction} from './socket';

export const DATABASE_OPERATION = 'DATABASE_OPERATION';

export function databaseOperation(method, table, data) {
    return serverAction({type: DATABASE_OPERATION, method, table, data});
}

export const SET_DETECTIONS = 'SET_DETECTIONS';
export const ADD_DETECTIONS = 'ADD_DETECTIONS';

export function setDetections(data) {
    return {type: SET_DETECTIONS, data};
}
export function addDetections(data) {
    return {type: ADD_DETECTIONS, data};
}

export const SET_LABELS = 'SET_LABELS';
export const ADD_LABELS = 'ADD_LABELS';
export const UPDATE_LABEL_NAME = 'UPDATE_LABEL_NAME';

export function setLabels(data) {
    return {type: SET_LABELS, data};
}
export function addLabels(data) {
    return {type: ADD_LABELS, data};
}
export function updateLabelName(label) {
    return {type: UPDATE_LABEL_NAME, label};
}

export const SET_SNAPSHOT = 'SET_SNAPSHOT';

export function setSnapshot(data) {
    return {type: SET_SNAPSHOT, data};
}

export const SET_ACTIVE_ITEM = 'SET_ACTIVE_ITEM';

export function setActiveItem(value) {
    return {type: SET_ACTIVE_ITEM, value};
}

export const TRAIN_CLASSIFIER = 'TRAIN_CLASSIFIER';

export function trainClassifier() {
    return serverAction({type: TRAIN_CLASSIFIER});
}
