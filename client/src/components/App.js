import React from 'react';
import {Grid, Row, Col} from 'react-bootstrap';

import DetectionHistory from '../containers/DetectionHistory';
import DetectionLive from '../containers/DetectionLive';

class App extends React.Component {

    render() {
        return <Grid className="App">
            <Row>
                <Col md={6}>
                    <h1>Snapshots</h1>
                    <DetectionLive width={480} height={368}/>
                </Col>
                <Col md={6}>
                    <h1>Labels</h1>
                    <DetectionHistory/>
                </Col>
            </Row>
        </Grid>;
    }
}

export default App;