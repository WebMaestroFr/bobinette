import {combineReducers} from 'redux';
import {
    SET_FACES,
    ADD_FACES,
    SET_LABELS,
    ADD_LABELS,
    UPDATE_LABEL_NAME,
    SET_SNAPSHOT,
    SET_ACTIVE_ITEM
} from './actions';

function faces(state = [], action) {
    switch (action.type) {
        case SET_FACES:
            return action.data;
        case ADD_FACES:
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
    faces: [],
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

function activeItem(state = null, action) {
    switch (action.type) {
        case SET_ACTIVE_ITEM:
            return action.key;
        default:
            return state;
    }
}

const appReducers = combineReducers({faces, labels, snapshot, activeItem});

export default appReducers;