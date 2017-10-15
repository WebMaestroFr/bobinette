import React from 'react';
import {Grid, Row, Col, ButtonGroup, Glyphicon} from 'react-bootstrap';

import LabelHistory from '../containers/LabelHistory';
import SnapshotLive from '../containers/SnapshotLive';
import ServerAction from '../containers/ServerAction';

import './App.css';

class App extends React.Component {

    render() {
        return <Grid className="App">
            <Row>
                <Col md={6} className="App-snapshot-live">
                    <h1>Bobinette</h1>
                    <SnapshotLive width={480} height={368}/>
                </Col>
                <Col md={6} className="App-label-history">
                    <ButtonGroup className="App-actions">
                        <ServerAction action="OPEN_LOCK">
                            <Glyphicon glyph="lock"/>&nbsp;Open
                        </ServerAction>
                        <ServerAction action="TRAIN_LABELS">
                            <Glyphicon glyph="refresh"/>&nbsp;Train
                        </ServerAction>
                    </ButtonGroup>
                    <LabelHistory/>
                </Col>
            </Row>
        </Grid>;
    }
}

export default App;