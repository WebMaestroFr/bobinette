import {combineReducers} from 'redux';
import {
    SET_DETECTIONS,
    ADD_DETECTIONS,
    SET_LABELS,
    ADD_LABELS,
    SET_SNAPSHOT,
    UPDATE_LABEL_NAME
} from './actions';

function detections(state = [], action) {
    switch (action.type) {
        case SET_DETECTIONS:
            return action.data;
        case ADD_DETECTIONS:
            return state.concat(action.data);
        default:
            return state;
    }
}

function labels(state = [], action) {
    switch (action.type) {
        case SET_LABELS:
            return action.data;
        case ADD_LABELS:
            return state.concat(action.data);
        case UPDATE_LABEL_NAME:
            return state.map((label) => {
                if (label.id === action.label.id) {
                    return action.label;
                }
                return label;
            });
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
            return action.data.date > state.date
                ? action.data
                : state;
        default:
            return state;
    }
}

const appReducers = combineReducers({detections, labels, snapshot});

export default appReducers;