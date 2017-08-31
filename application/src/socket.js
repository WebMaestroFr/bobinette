import io from 'socket.io-client';

export const SOCKET_OPEN = 'SOCKET_OPEN';
export const SOCKET_CLOSE = 'SOCKET_CLOSE';
export const SOCKET_ACTION = 'SOCKET_ACTION';

let socket = null;

const close = () => {
    if (socket) {
        socket.close();
        socket = null;
    }
};

const open = ({
    dispatch
}, url) => {
    close();
    socket = io(url);
    socket.on('action', (action) => {
        dispatch(action);
    });
};

export function socketAction(action) {
    return {type: SOCKET_ACTION, action};
}

export default store => next => action => {
    switch (action.type) {
        case SOCKET_OPEN:
            open(store, action.url);
            next(action);
            break;
        case SOCKET_CLOSE:
            close();
            next(action);
            break;
        case SOCKET_ACTION:
            if (socket) {
                const {
                    type,
                    ...data
                } = action.action;
                socket.emit(type, data);
            }
            next(action);
            break;
        default:
            next(action);
    }
};