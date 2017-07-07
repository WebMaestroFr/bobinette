import React, {Component} from 'react';
import {Grid, Row, Col} from 'react-bootstrap';
import PropTypes from 'prop-types';

import Snapshot from './components/Snapshot';

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            snapshot: {},
            labels: [],
            detections: []
        };
    }

    componentDidMount() {
        this.updateState = (e) => {
            const message = JSON.parse(e.data);
            console.log(message.type, message.data);
            return this.setState({
                [message.type]: message.data
            });
        };
        this.socket = new WebSocket(`ws://${document.location.hostname}:${this.props.port}`);
        this
            .socket
            .addEventListener(`message`, this.updateState);
    }

    componentWillUnmount() {
        this
            .socket
            .removeEventListener(`message`, this.updateState);
    }

    render() {
        const listLabels = this
            .state
            .labels
            .map((label) => <li key={label.id}>{label.name}</li>);
        const listDetections = this
            .state
            .detections
            .map((detection, index) => <li key={index}>{new Date(detection.date).toLocaleString()}</li>);
        return (
            <Grid className="App">
                <Row>
                    <Col md={6}>
                        <h1>Snapshots</h1>
                        <Snapshot {...this.state.snapshot} width={480} height={368}/>
                        <h1>Labels</h1>
                        <ul>{listLabels}</ul>
                    </Col>
                    <Col md={6}>
                        <h1>Detections</h1>
                        <ul>{listDetections}</ul>
                    </Col>
                </Row>
            </Grid>
        );
    }
}

App.propTypes = {
    port: PropTypes.number.isRequired
};

export default App;