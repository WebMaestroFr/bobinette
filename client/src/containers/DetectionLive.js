import {connect} from 'react-redux';
import Snapshot from '../components/Snapshot';

const mapStateToProps = (state, props) => {
    return {
        ...state.snapshot,
        ...props
    };
};

const DetectionLive = connect(mapStateToProps);

export default DetectionLive(Snapshot);