import React from 'react';
import {
    ButtonToolbar,
    Col,
    Glyphicon,
    Grid,
    Row,
    Tab,
    Tabs
} from 'react-bootstrap';

import LabelHistory from '../containers/LabelHistory';
import SnapshotLive from '../containers/SnapshotLive';
import ServerAction from '../containers/ServerAction';
import NetworkConfig from '../containers/NetworkConfig';

import './App.css';

class App extends React.Component {

    render() {
        return <Grid className="App">
            <Row>
                <Col md={6} className="App-snapshot-live">
                    <Row>
                        <Col xs={6}>
                            <h1>Bobinette</h1>
                        </Col>
                        <Col xs={6}>
                            <ButtonToolbar className="App-actions">
                                <ServerAction action="OPEN_LOCK">
                                    <Glyphicon glyph="lock"/>&nbsp;Open
                                </ServerAction>
                            </ButtonToolbar>
                        </Col>
                    </Row>
                    <SnapshotLive width={640} height={480}/>
                    <h2>Configuration</h2>
                    <Tabs defaultActiveKey={1} className="App-configuration" id="configuration">
                        <Tab eventKey={1} title="Network"><NetworkConfig/></Tab>
                    </Tabs>
                </Col>
                <Col md={6} className="App-label-history">
                    <Row>
                        <Col xs={6}>
                            <h2>History</h2>
                        </Col>
                        <Col xs={6}>
                            <ButtonToolbar className="App-actions">
                                <ServerAction action="TRAIN_LABELS">
                                    <Glyphicon glyph="refresh"/>&nbsp;Train
                                </ServerAction>
                            </ButtonToolbar>
                        </Col>
                    </Row>
                    <LabelHistory/>
                </Col>
            </Row>
        </Grid>;
    }
}

export default App;