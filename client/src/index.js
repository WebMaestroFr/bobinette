import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import 'bootstrap/dist/css/bootstrap.css';
import './index.css';

ReactDOM.render(
    <App port={8000}/>, document.getElementById("root"));

registerServiceWorker();