import React, {Component} from 'react';
import {Grid, Row, Col} from 'react-bootstrap';
import PropTypes from 'prop-types';

import Detection from './components/Detection';
import Snapshot from './components/Snapshot';

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            labels: [],
            snapshot: {
                date: 0,
                detections: [],
                image: null
            }
        };
        this.handleMessage = this
            .handleMessage
            .bind(this);
    }

    handleMessage(e) {
        const message = JSON.parse(e.data);

        switch (message.type) {

            case `labels`:
                return this.setState({
                    labels: this
                        .state
                        .labels
                        .concat(message.data)
                });

            case `snapshot`:
                const labels = [...this.state.labels];
                let l;
                for (let detection of message.data.detections) {
                    l = labels.findIndex((label) => {
                        return label.id === detection.label;
                    });
                    if (l < 0) {
                        continue;
                    }
                    labels[l].detections = labels[l]
                        .detections
                        .concat([detection]);
                }
                return this.setState({snapshot: message.data, labels: labels});

            default:
                return this.setState({
                    [message.type]: message.data
                });
        }
    }

    componentDidMount() {
        this.socket = new WebSocket(`ws://${document.location.hostname}:${this.props.port}`);
        this
            .socket
            .addEventListener(`message`, this.handleMessage);
    }

    componentWillUnmount() {
        this
            .socket
            .removeEventListener(`message`, this.handleMessage);
    }

    render() {
        return (
            <Grid className="App">
                <Row>
                    <Col md={6}>
                        <h1>Snapshots</h1>
                        <Snapshot {...this.state.snapshot} width={480} height={368}/>
                    </Col>
                    <Col md={6}>
                        <h1>Labels</h1>
                        <Detection labels={this.state.labels}/>
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