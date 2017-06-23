import React, {Component} from 'react';
import {Grid, Row, Col} from 'react-bootstrap';
import PropTypes from 'prop-types';

import Snapshot from './components/Snapshot';

class App extends Component {

    componentDidMount() {
        this.updateState = (e) => {
            const message = JSON.parse(e.data);
            console.log(message.type, message.data);
            this.setState({
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
        return (
            <Grid className="App">
                <Row>
                    <Col md={12}>
                        <h1>Snapshots</h1>
                        <Snapshot instance={this.state.snapshot} width={480} height={368}/>
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
