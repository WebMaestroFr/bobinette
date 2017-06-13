import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import 'bootstrap/dist/css/bootstrap.css';
// import 'bootstrap/dist/css/bootstrap-theme.css';
import './index.css';

ReactDOM.render(
    <App cameraPort={9000} appPort={9001}/>, document.getElementById('root'));
