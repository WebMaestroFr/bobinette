import React from 'react';
import {Grid, Row, Col, Button} from 'react-bootstrap';

import DetectionHistory from '../containers/DetectionHistory';
import DetectionLive from '../containers/DetectionLive';

import './App.css';

class App extends React.Component {

    render() {
        return <Grid className="App">
            <Row>
                <Col md={6} className="App-detections">
                    <h1>Detections</h1>
                    <DetectionLive width={480} height={368}/>
                </Col>
                <Col md={6} className="App-labels">
                    <Row>
                        <Col xs={8}>
                            <h1>Labels</h1>
                        </Col>
                        <Col xs={4}>
                            <Button block className="App-train">Train</Button>
                        </Col>
                    </Row>
                    <DetectionHistory/>
                </Col>
            </Row>
        </Grid>;
    }
}

export default App;