import {connect} from 'react-redux';
import {networkConnect} from '../actions';
import {socketAction} from '../socket';
import NetworkForm from '../components/NetworkForm';

const mapStateToProps = (state) => {
    return {networks: state.networks};
};

const mapDispatchToProps = (dispatch) => {
    return {
        onSubmit: (ssid, psk) => {
            const action = networkConnect(ssid, psk);
            const serverAction = socketAction(action);
            dispatch(serverAction);
        }
    };
};

const NetworkConfig = connect(mapStateToProps, mapDispatchToProps);

export default NetworkConfig(NetworkForm);