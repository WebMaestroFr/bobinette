import {combineReducers} from 'redux';
import {
    SET_LABELS,
    ADD_LABELS,
    UPDATE_LABEL_NAME,
    SET_SNAPSHOT,
    SET_FOCUSED_LABEL,
    SET_NETWORKS,
    SET_ACTIVE_NETWORK
} from './actions';

function focusedLabel(state = null, action) {
    switch (action.type) {
        case SET_FOCUSED_LABEL:
            return action.key;
        default:
            return state;
    }
}

function labels(state = [], action) {
    switch (action.type) {
        case SET_LABELS:
            return action.labels;
        case ADD_LABELS:
            return state.concat(action.labels);
        case UPDATE_LABEL_NAME:
            return state.map((label) => {
                if (label.id === action.id) {
                    label.name = action.name;
                }
                return label;
            });
        case SET_SNAPSHOT:
            return state.map((label) => {
                const detection = action
                    .snapshot
                    .detections
                    .find(d => label.id === d.label_id);
                if (detection && detection.snapshot_date > label.detection.snapshot_date) {
                    label.detection = detection;
                }
                return label;
            });
        default:
            return state;
    }
}

function networks(state = [], action) {
    switch (action.type) {
        case SET_NETWORKS:
            return action.networks;
        default:
            return state;
    }
}

function snapshot(state = {
    date: 0,
    detections: [],
    image: null
}, action) {
    switch (action.type) {
        case SET_SNAPSHOT:
            return action.snapshot.date > state.date
                ? action.snapshot
                : state;
        default:
            return state;
    }
}

const appReducers = combineReducers({focusedLabel, labels, networks, snapshot});

export default appReducers;