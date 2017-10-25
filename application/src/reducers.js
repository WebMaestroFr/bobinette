import {combineReducers} from 'redux';
import {ADD_LABELS, SET_LABELS, SET_NETWORKS, SET_SNAPSHOT, UPDATE_LABEL} from './actions';

function labels(state = [], action) {
    switch (action.type) {
        case SET_LABELS:
            return action.labels;
        case ADD_LABELS:
            return state.concat(action.labels);
        case UPDATE_LABEL:
            return state.map((label) => {
                if (label.id === action.id) {
                    Object.assign(label, action.label);
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

const appReducers = combineReducers({labels, networks, snapshot});

export default appReducers;