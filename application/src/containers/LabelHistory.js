import {connect} from 'react-redux';
import {updateLabel} from '../actions';
import {socketAction} from '../socket';
import LabelList from '../components/LabelList';

const byDate = (a, b) => b.detection.snapshot_date - a.detection.snapshot_date;

const mapStateToProps = (state) => {
    return {
        labels: state
            .labels
            .sort(byDate)
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        onChange: (id, label) => {
            const action = updateLabel(id, label);
            const serverAction = socketAction(action);
            dispatch(action);
            dispatch(serverAction);
        }
    };
};

const LabelHistory = connect(mapStateToProps, mapDispatchToProps);

export default LabelHistory(LabelList);