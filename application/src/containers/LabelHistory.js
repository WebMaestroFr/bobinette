import {connect} from 'react-redux';
import {updateLabelName, setActiveItem} from '../actions';
import {socketAction} from '../socket';
import LabelList from '../components/LabelList';

const byDate = (a, b) => b.date - a.date;
const toLatest = (a, b) => a.date > b.date
    ? a
    : b;

const mapStateToProps = state => {
    const toItem = ({id, name}) => {
        const byLabel = ({label_id}) => label_id === id;
        const labelDetections = state
            .detections
            .filter(byLabel);
        if (labelDetections.length === 0) {
            return null;
        }
        const {date, thumbnail} = labelDetections.reduce(toLatest);
        return {id, date, name, thumbnail};
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
            dispatch(action);
            const serverAction = socketAction(action);
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

const LabelHistory = connect(mapStateToProps, mapDispatchToProps);

export default LabelHistory(LabelList);