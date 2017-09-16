import {connect} from 'react-redux';
import {updateLabelName, setActiveLabel} from '../actions';
import {socketAction} from '../socket';
import LabelList from '../components/LabelList';

const byDate = (a, b) => b.detection.snapshot_date - a.detection.snapshot_date;

const mapStateToProps = (state) => {
    const byName = (element, index, array) => {
        // Filter items : not null with a unique (most recent) or empty name,
        const isDifferentNameOrOlder = (e, i, a) => !e || index === i || element.name !== e.name || element.detection.snapshot_date > e.detection.snapshot_date;
        return element && (!element.name || state.activeLabel === element.id || array.every(isDifferentNameOrOlder));
    };
    return {
        labels: state
            .labels
            .filter(byName)
            .sort(byDate)
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        onNameChange: (id, name) => {
            const action = updateLabelName(id, name);
            const serverAction = socketAction(action);
            dispatch(action);
            dispatch(serverAction);
        },
        onNameFocus: (id) => {
            const action = setActiveLabel(id);
            dispatch(action);
        },
        onNameBlur: () => {
            const action = setActiveLabel(null);
            dispatch(action);
        }
    };
};

const LabelHistory = connect(mapStateToProps, mapDispatchToProps);

export default LabelHistory(LabelList);