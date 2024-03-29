import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {createStore, applyMiddleware} from 'redux';
// import logger from 'redux-logger';

import appReducers from './reducers'
import socket, {socketOpen} from './socket';

import App from './components/App';

import 'bootstrap/dist/css/bootstrap.css';
import './index.css';

// let store = createStore(appReducers, applyMiddleware(logger, socket));
let store = createStore(appReducers, applyMiddleware(socket));

const socketOpenAction = socketOpen();
store.dispatch(socketOpenAction);

const app = <Provider store={store}><App/></Provider>;

ReactDOM.render(app, document.getElementById("root"));