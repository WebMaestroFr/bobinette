import {connect} from 'react-redux';
import {updateLabel, trainLabel} from '../actions';
import {socketAction} from '../socket';
import LabelList from '../components/LabelList';

const byDate = (a, b) => b.detection.snapshot_date - a.detection.snapshot_date;

const mapStateToProps = (state) => {
    const labels = state
        .labels
        .sort(byDate);
    labels.map((label) => {
        const byName = (l) => l.name && l.name === label.name && l.id !== label.id;
        label.homonyms = labels.filter(byName);
        label.validationState = !label.name
            ? "error"
            : label.homonyms.length
                ? "warning"
                : label.access
                    ? "success"
                    : null;
        return label;
    });
    return {labels};
};

const mapDispatchToProps = (dispatch) => {
    return {
        onChange: (id, label) => {
            const action = updateLabel(id, label);
            const serverAction = socketAction(action);
            dispatch(action);
            dispatch(serverAction);
        },
        onTrain: (id) => {
            const action = trainLabel(id);
            const serverAction = socketAction(action);
            dispatch(serverAction);
        }
    };
};

const LabelHistory = connect(mapStateToProps, mapDispatchToProps);

export default LabelHistory(LabelList);