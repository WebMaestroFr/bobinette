import {connect} from 'react-redux';
import Snapshot from '../components/Snapshot';

class SnapshotLiveComponent extends Snapshot {
    shouldComponentUpdate({date}) {
        return date > this.props.date;
    }
}

const mapStateToProps = (state, props) => {
    return {
        ...state.snapshot,
        ...props
    };
};

const SnapshotLive = connect(mapStateToProps);

export default SnapshotLive(SnapshotLiveComponent);