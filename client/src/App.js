import React from 'react';
import PropTypes from 'prop-types';
import {Grid, Row, Col} from 'react-bootstrap';

import LabelList from './components/Label';
import Snapshot from './components/Snapshot';

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            labels: [],
            detections: [],
            snapshot: {
                date: 0,
                detections: [],
                image: null
            }
        };
        this.handleMessage = this
            .handleMessage
            .bind(this);
        this.handleLabelChange = this
            .handleLabelChange
            .bind(this);
    }

    handleMessage({data}) {
        const message = JSON.parse(data);
        switch (message.type) {
            case `snapshot`:
                return this.setState({
                    snapshot: message.data,
                    detections: this
                        .state
                        .detections
                        .concat(message.data.detections)
                });
            default:
                return this.setState({
                    [message.type]: this
                        .state[message.type]
                        .concat(message.data)
                });
        }
    }

    handleLabelChange({id, name}) {
        const labels = [...this.state.labels];
        Object.assign(labels.find((label) => {
            return label.id === id;
        }), {name});
        return this.setState({labels});
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
        return <Grid className="App">
            <Row>
                <Col md={6}>
                    <h1>Snapshots</h1>
                    <Snapshot ref="snapshot" {...this.state.snapshot} width={480} height={368}/>
                </Col>
                <Col md={6}>
                    <h1>Labels</h1>
                    <LabelList
                        labels={this.state.labels}
                        detections={this.state.detections}
                        onChange={this.handleLabelChange}/>
                </Col>
            </Row>
        </Grid>;
    }
}

App.propTypes = {
    port: PropTypes.number.isRequired
};

export default App;