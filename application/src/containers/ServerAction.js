import {connect} from 'react-redux';
import Trigger from '../components/Trigger';
import {socketAction} from '../socket';

const mapStateToProps = (state, props) => {
    return {
        ...props
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        onClick: (action) => {
            const serverAction = socketAction(action);
            dispatch(serverAction);
        }
    };
};

const ServerAction = connect(mapStateToProps, mapDispatchToProps);

export default ServerAction(Trigger);