import React, {Component} from 'react';
import {Grid, Row, Col} from 'react-bootstrap';
import PropTypes from 'prop-types';

import Snapshot from './components/Snapshot';

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            snapshot: {}
        };
    }

    componentDidMount() {
        this.updateState = (e) => {
            const message = JSON.parse(e.data);
            switch (message.type) {
                case `snapshot`:
                    return this.setState((state) => {
                        return {snapshot: message.data}
                    });
                default:
                    return this.state;
            }
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
        return (
            <Grid className="App">
                <Row>
                    <Col md={6}>
                        <h1>Snapshots</h1>
                        <Snapshot {...this.state.snapshot} width={480} height={368}/>
                    </Col>
                    <Col md={6}>
                        <h1>Labels</h1>
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