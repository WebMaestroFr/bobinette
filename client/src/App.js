import React, {Component} from 'react';
import {Grid, Row, Col} from 'react-bootstrap';
import PropTypes from 'prop-types';

import Archive from './components/Archive';
import Camera from './components/Camera';
import Session from './components/Session';
import Detection from './components/Detection';

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            detections: []
        };
    }

    componentDidMount() {
        this.updateState = (e) => {
            const message = JSON.parse(e.data);
            console.log(message.type, message.data);
            this.setState({
                [message.type]: message.data
            });
        };
        this.socket = new WebSocket(`ws://${document.location.hostname}:${this.props.appPort}`);
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
        return (
            <Grid className="App">
                <Row>
                    <Col md={6}>
                        <h1>Camera Video Stream</h1>
                        <Detection detections={this.state.detections} width={480} height={360}>
                            <Camera port={this.props.cameraPort} width={480} height={360}/>
                        </Detection>
                        <h1>Face Detection Sequences</h1>
                        <Session event="session-live"/>
                    </Col>
                    <Col md={6}>
                        <h1>Activity Thread</h1>
                        <Archive event="session-history" component={Session}/>
                    </Col>
                </Row>
            </Grid>
        );
    }
}

App.propTypes = {
    appPort: PropTypes.number.isRequired,
    cameraPort: PropTypes.number.isRequired
};

export default App;
