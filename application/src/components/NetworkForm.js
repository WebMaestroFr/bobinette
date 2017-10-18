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
    InputGroup,
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
        const handleSubmit = () => this
            .props
            .onSubmit(this.state.cell.ssid, this.state.psk);
        return <Form onSubmit={handleSubmit} horizontal>
            <FormGroup controlId="NetworkForm-cell-address">
                <Col componentClass={ControlLabel} sm={2}>
                    <abbr title="Service Set Identifier">SSID</abbr>
                </Col>
                <Col sm={10}>
                    <InputGroup>
                        <FormControl
                            componentClass="select"
                            onChange={handleCellChange}
                            placeholder="Service Set Identifier"
                            value={this.state.cell
                            ? this.state.cell.address
                            : undefined}>
                            {this
                                .props
                                .networks
                                .sort((a, b) => b.signal - a.signal)
                                .map((cell) => <option value={cell.address} key={cell.address}>
                                    {cell.ssid}
                                </option>)}
                        </FormControl>
                        <InputGroup.Button>
                            <ServerAction action="NETWORK_SCAN">
                                <Glyphicon glyph="refresh"/>&nbsp;Scan
                            </ServerAction>
                        </InputGroup.Button>
                    </InputGroup>
                </Col>
            </FormGroup>
            <FormGroup controlId="NetworkForm-psk">
                <Col componentClass={ControlLabel} sm={2}>
                    <abbr title="Pre-Shared Key">PSK</abbr>
                </Col>
                <Col sm={10}>
                    <FormControl
                        disabled={!this.state.cell || this.state.cell.active || !this.state.cell.encrypted}
                        onChange={handlePskChange}
                        placeholder="Pre-Shared Key"
                        type="password"
                        value={this.state.psk}/>
                </Col>
            </FormGroup>
            <FormGroup>
                <Col smOffset={2} sm={10}>
                    <Button type="submit">Connect</Button>
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
    onPskChange: PropTypes.func
};

export default NetworkForm;