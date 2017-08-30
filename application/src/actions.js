export const SET_FACES = 'SET_FACES';
export const ADD_FACES = 'ADD_FACES';

export function setFaces(data) {
    return {type: SET_FACES, data};
}
export function addFaces(data) {
    return {type: ADD_FACES, data};
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

export function setActiveItem(key) {
    return {type: SET_ACTIVE_ITEM, key};
}
