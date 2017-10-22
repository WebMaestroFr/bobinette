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
                <Col md={6}>
                    <Row className="App-header" componentClass="header">
                        <Col xs={6} className="App-title" componentClass="h1">Bobinette</Col>
                        <Col xs={6} className="App-actions" componentClass={ButtonToolbar}>
                            <ServerAction action="OPEN_LOCK" bsSize="large">
                                <Glyphicon glyph="lock"/>&nbsp;Open
                            </ServerAction>
                        </Col>
                    </Row>
                    <Tabs defaultActiveKey={1} id="App-main" className="App-main">
                        <Tab eventKey={1} title="Camera">
                            <SnapshotLive width={640} height={480}/>
                        </Tab>
                        <Tab eventKey={2} title="Network">
                            <NetworkConfig/>
                        </Tab>
                    </Tabs>
                </Col>
                <Col md={6} className="App-label-history">
                    <LabelHistory/>
                </Col>
            </Row>
        </Grid>;
    }
}

export default App;