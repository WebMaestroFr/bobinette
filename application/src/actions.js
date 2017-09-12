export const SET_LABELS = 'SET_LABELS';
export const ADD_LABELS = 'ADD_LABELS';
export const UPDATE_LABEL_NAME = 'UPDATE_LABEL_NAME';

export function setLabels(labels) {
    return {type: SET_LABELS, labels};
}
export function addLabels(labels) {
    return {type: ADD_LABELS, labels};
}
export function updateLabelName(id, name) {
    return {type: UPDATE_LABEL_NAME, id, name};
}

export const SET_ACTIVE_LABEL = 'SET_ACTIVE_LABEL';

export function setActiveLabel(key) {
    return {type: SET_ACTIVE_LABEL, key};
}

export const SET_SNAPSHOT = 'SET_SNAPSHOT';

export function setSnapshot(snapshot) {
    return {type: SET_SNAPSHOT, snapshot};
}
