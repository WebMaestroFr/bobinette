import {connect} from 'react-redux';
import {updateLabelName} from '../actions';
import {serverAction} from '../socket';
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
    return {
        items: state
            .labels
            .map(toItem)
            .filter(Boolean)
            .sort(byDate)
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onNameChange: (label) => {
            const action = updateLabelName(label);
            const serverUpdate = serverAction(`update`, `label`, label);
            dispatch(action);
            dispatch(serverUpdate);
        }
    };
};

const DetectionHistory = connect(mapStateToProps, mapDispatchToProps);

export default DetectionHistory(LabelList);