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

export const SET_FOCUSED_LABEL = 'SET_FOCUSED_LABEL';

export function setActiveLabel(key) {
    return {type: SET_FOCUSED_LABEL, key};
}

export const SET_SNAPSHOT = 'SET_SNAPSHOT';

export function setSnapshot(snapshot) {
    return {type: SET_SNAPSHOT, snapshot};
}

export const SET_NETWORKS = 'SET_NETWORKS';
export const SET_ACTIVE_NETWORK = 'SET_ACTIVE_NETWORK';
export const NETWORK_CONNECT = 'NETWORK_CONNECT';

export function networkConnect(ssid, psk) {
    return {type: NETWORK_CONNECT, ssid, psk};
}
