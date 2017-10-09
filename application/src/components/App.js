import React from 'react';
import {Grid, Row, Col} from 'react-bootstrap';

import LabelHistory from '../containers/LabelHistory';
import SnapshotLive from '../containers/SnapshotLive';
import ServerAction from '../containers/ServerAction';

import './App.css';

class App extends React.Component {

    render() {
        return <Grid className="App">
            <Row>
                <Col md={6} className="App-snapshot-live">
                    <h1>Live</h1>
                    <SnapshotLive width={480} height={368}/>
                </Col>
                <Col md={6} className="App-label-history">
                    <Row>
                        <Col xs={8}>
                            <h1>History</h1>
                        </Col>
                        <Col className="App-open" xs={2}>
                            <ServerAction action="OPEN_LOCK">Open</ServerAction>
                        </Col>
                        <Col className="App-open" xs={2}>
                            <ServerAction action="TRAIN_LABELS">Train</ServerAction>
                        </Col>
                    </Row>
                    <LabelHistory/>
                </Col>
            </Row>
        </Grid>;
    }
}

export default App;