import React from 'react';
import {Grid, Row, Col, Button} from 'react-bootstrap';

import LabelHistory from '../containers/LabelHistory';
import SnapshotLive from '../containers/SnapshotLive';

import './App.css';

class App extends React.Component {

    render() {
        return <Grid className="App">
            <Row>
                <Col md={6} className="App-snapshot-live">
                    <h1>Detection</h1>
                    <SnapshotLive width={480} height={368}/>
                </Col>
                <Col md={6} className="App-label-history">
                    <Row>
                        <Col xs={8}>
                            <h1>Labels</h1>
                        </Col>
                        <Col xs={4}>
                            <Button block className="App-train">Train</Button>
                        </Col>
                    </Row>
                    <LabelHistory/>
                </Col>
            </Row>
        </Grid>;
    }
}

export default App;