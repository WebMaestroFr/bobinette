import React from 'react';
import PropTypes from 'prop-types';
import {
    Button,
    Col,
    ControlLabel,
    Form,
    FormGroup,
    FormControl,
    Glyphicon,
    Row
} from 'react-bootstrap';
import ServerAction from '../containers/ServerAction';

class NetworkForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cell: null,
            psk: ''
        };
    }

    componentWillReceiveProps({networks}) {
        this.setState({
            cell: networks
                ? networks.reduce((a, b) => a.signal > b.signal
                    ? a
                    : b)
                : null,
            psk: ''
        });
    }

    render() {
        const handleCellChange = ({target}) => this.setState({
            cell: this
                .props
                .networks
                .find((c) => c.address === target.value),
            psk: ''
        });
        const handlePskChange = ({target}) => this.setState({psk: target.value});
        const handleSubmit = (event) => {
            event.preventDefault();
            this
                .props
                .onSubmit(this.state.cell.ssid, this.state.psk);
        };
        const renderCell = (cell) => <option value={cell.address} key={cell.address}>
            {cell.ssid}
        </option>;
        const cells = this
            .props
            .networks
            .sort((a, b) => b.signal - a.signal)
            .map(renderCell);
        return <Form onSubmit={handleSubmit}>
            <FormGroup controlId="NetworkForm-cell">
                <ControlLabel>Wifi</ControlLabel>
                <Row>
                    <Col xs={8} sm={10} md={9}>
                        <FormControl
                            componentClass="select"
                            onChange={handleCellChange}
                            placeholder="Service Set Identifier"
                            value={this.state.cell
                            ? this.state.cell.address
                            : undefined}>
                            {cells}
                        </FormControl>
                    </Col>
                    <Col xs={4} sm={2} md={3}>
                        <ServerAction action="NETWORK_SCAN" block>
                            <Glyphicon glyph="refresh"/>
                        </ServerAction>
                    </Col>
                </Row>
            </FormGroup>
            <Row>
                <Col componentClass={FormGroup} xs={8} sm={10} md={9} controlId="NetworkForm-psk">
                    <ControlLabel>Password</ControlLabel>
                    <FormControl
                        disabled={!this.state.cell || this.state.cell.active || !this.state.cell.encrypted}
                        onChange={handlePskChange}
                        placeholder="Pre-Shared Key"
                        type="password"
                        value={this.state.psk}/>
                </Col>
                <Col componentClass={FormGroup} xs={4} sm={2} md={3}>
                    <ControlLabel className="invisible">Submit</ControlLabel>
                    <Button type="submit" bsStyle="primary" block>Connect</Button>
                </Col>
            </Row>
        </Form>;
    }
}
const cellPropTypes = {
    active: PropTypes.boolean,
    address: PropTypes.string,
    encrypted: PropTypes.boolean,
    ssid: PropTypes.string
}
NetworkForm.propTypes = {
    networks: PropTypes.arrayOf(PropTypes.shape(cellPropTypes)),
    onPskChange: PropTypes.func
};

export default NetworkForm;