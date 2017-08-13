import {connect} from 'react-redux';
import {updateLabelName, setActiveItem, databaseOperation} from '../actions';
import LabelList from '../components/LabelList';

const byDate = (a, b) => b.date - a.date;
const toLatest = (a, b) => a.date > b.date
    ? a
    : b;

const mapStateToProps = state => {
    const toItem = ({id, name}) => {
        const byLabel = ({label}) => label === id;
        const labelDetections = state
            .detections
            .filter(byLabel);
        if (labelDetections.length === 0) {
            return null;
        }
        const {date, image} = labelDetections.reduce(toLatest);
        return {id, date, name, image};
    };
    const byName = (element, index, array) => {
        return element && (!element.name || state.activeItem === element.id || array.every((e, i, a) => {
            return !e || index === i || element.name !== e.name || element.date > e.date;
        }));
    };
    return {
        items: state
            .labels
            .map(toItem)
            .filter(byName)
            .sort(byDate)
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onNameChange: (label) => {
            const action = updateLabelName(label);
            const serverAction = databaseOperation(`update`, `label`, label);
            dispatch(action);
            dispatch(serverAction);
        },
        onNameFocus: (id) => {
            const action = setActiveItem(id);
            dispatch(action);
        },
        onNameBlur: () => {
            const action = setActiveItem(null);
            dispatch(action);
        }
    };
};

const DetectionHistory = connect(mapStateToProps, mapDispatchToProps);

export default DetectionHistory(LabelList);