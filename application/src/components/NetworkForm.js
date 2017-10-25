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
    InputGroup
} from 'react-bootstrap';

import ServerAction from '../containers/ServerAction';

class NetworkForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            cell: null,
            psk: ''
        };
        this.onSubmit = this
            .onSubmit
            .bind(this);
    }

    onSubmit(event) {
        event.preventDefault();
        return this
            .props
            .onSubmit(this.state.cell.ssid, this.state.psk);
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
        const renderCell = (cell) => <option value={cell.address} key={cell.address}>
            {cell.ssid}
        </option>;
        const cells = this
            .props
            .networks
            .sort((a, b) => b.signal - a.signal)
            .map(renderCell);
        return <Form onSubmit={this.onSubmit} horizontal>
            <FormGroup controlId="NetworkForm-cell">
                <Col sm={3} componentClass={ControlLabel}>Wifi</Col>
                <Col sm={6}>
                    <InputGroup>
                        <FormControl
                            componentClass="select"
                            onChange={handleCellChange}
                            placeholder="Service Set Identifier"
                            value={this.state.cell
                            ? this.state.cell.address
                            : undefined}>
                            {cells}
                        </FormControl>
                        <InputGroup.Button>
                            <ServerAction action="NETWORK_SCAN">
                                <Glyphicon glyph="refresh"/>
                            </ServerAction>
                        </InputGroup.Button>
                    </InputGroup>
                </Col>
            </FormGroup>
            <FormGroup controlId="NetworkForm-psk">
                <Col sm={3} componentClass={ControlLabel}>Password</Col>
                <Col sm={6}>
                    <FormControl
                        disabled={!this.state.cell || this.state.cell.active || !this.state.cell.encrypted}
                        onChange={handlePskChange}
                        placeholder="Pre-Shared Key"
                        type="password"
                        value={this.state.psk}/>
                </Col>
            </FormGroup>
            <FormGroup>
                <Col sm={9} smOffset={3}>
                    <Button type="submit" bsStyle="primary">Connect</Button>
                </Col>
            </FormGroup>
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
    onSubmit: PropTypes.func
};

export default NetworkForm;