export const SOCKET_OPEN = 'SOCKET_OPEN';
export const SOCKET_CLOSE = 'SOCKET_CLOSE';
export const SOCKET_SEND = 'SOCKET_SEND';

let socket;

const close = () => {
    if (socket) {
        socket.close();
        socket = null;
    }
};

const open = ({
    dispatch
}, url, protocols) => {
    close();
    socket = new WebSocket(url, protocols);
    socket.onmessage = (event) => {
        const action = JSON.parse(event.data);
        dispatch(action);
    };
};

export function serverAction(method, table, data) {
    return {
        type: SOCKET_SEND,
        message: {
            method,
            table,
            data
        }
    };
}

export default store => next => action => {
    switch (action.type) {
        case SOCKET_OPEN:
            open(store, action.url, action.protocols);
            next(action);
            break;
        case SOCKET_CLOSE:
            close();
            next(action);
            break;
        case SOCKET_SEND:
            if (socket) {
                const data = JSON.stringify(action.message);
                socket.send(data);
            }
            next(action);
            break;
        default:
            next(action);
    }
};