import React, {Component} from 'react';
import {Grid, Row, Col} from 'react-bootstrap';
import Archive from './components/Archive';
import Camera from './components/Camera';
import Session from './components/Session';
import Vision from './components/Vision';

class App extends Component {
    componentDidMount() {
        this.socket = new WebSocket("ws://" + document.location.hostname + ":9001");
        this
            .socket
            .addEventListener("message", (e) => {
                const message = JSON.parse(e.data);
                const event = new CustomEvent(message.type);
                event.data = message.data;
                document.dispatchEvent(event);
            });
    }
    render() {
        return (
            <Grid className="App">
                <Row>
                    <Col md={6}>
                        <h1>Camera Video Stream</h1>
                        <Vision event="vision-detect" width={480} height={360}>
                            <Camera port={9000} width={480} height={360}/>
                        </Vision>
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

export default App;
