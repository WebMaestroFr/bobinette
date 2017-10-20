import React from 'react';
import PropTypes from 'prop-types';
import {Form, FormGroup, FormControl, InputGroup, Media} from 'react-bootstrap';

import Canvas from './Canvas'
import LocaleString from './LocaleString';

import './Label.css';

class Label extends React.Component {

    constructor(props) {
        super(props);
        const {access, name} = props;
        this.state = {
            access,
            name
        };
        this.onAccessChange = this
            .onAccessChange
            .bind(this);
        this.onNameChange = this
            .onNameChange
            .bind(this);
        this.onSubmit = this
            .onSubmit
            .bind(this);
    }

    onAccessChange({target}) {
        const state = Object.assign({
            ...this.state
        }, {access: target.checked});
        this.setState(state);
        return this.props.onChange
            ? this
                .props
                .onChange(this.props.id, state)
            : null;
    }

    onNameChange({target}) {
        const state = Object.assign({
            ...this.state
        }, {name: target.value});
        this.setState(state);
        return this.props.onChange
            ? this
                .props
                .onChange(this.props.id, state)
            : null;
    }

    onSubmit(event) {
        event.preventDefault();
        return this.props.onSubmit
            ? this
                .props
                .onSubmit(this.props.id, this.state)
            : null;
    }

    componentWillReceiveProps({access, name}) {
        this.setState({access, name});
    }

    shouldComponentUpdate({
        id,
        detection
    }, {access, name}) {
        return access !== this.state.access || id !== this.props.id || detection.snapshot_date !== this.props.detection.snapshot_date || name !== this.state.name;
    }

    render() {
        return <Media className="Label">
            <Media.Left>
                <Canvas
                    base64={this.props.detection.thumbnail}
                    className="Label-detection-thumbnail"
                    height={64}
                    ref="detection-thumbnail"
                    type="png"
                    width={64}/>
            </Media.Left>
            <Media.Body>
                <Form onSubmit={this.onSubmit}>
                    <FormGroup bsSize="large" controlId="labelName">
                        <LocaleString
                            className="Label-detection-date"
                            ref="detection-date"
                            timestamp={this.props.detection.snapshot_date}/>
                        <InputGroup>
                            <InputGroup.Addon>
                                <input
                                    aria-label="Access"
                                    checked={this.state.access}
                                    onChange={this.onAccessChange}
                                    ref="access"
                                    type="checkbox"/>
                            </InputGroup.Addon>
                            <FormControl
                                className="Label-name"
                                onChange={this.onNameChange}
                                placeholder={`Label #${this.props.id}`}
                                ref="name"
                                type="text"
                                value={this.state.name}/>
                        </InputGroup>
                    </FormGroup>
                </Form>
            </Media.Body>
        </Media>;
    }
}

const detectionPropTypes = {
    snapshot_date: PropTypes.number,
    thumbnail: PropTypes.string
};

Label.propTypes = {
    access: PropTypes.bool,
    id: PropTypes.number,
    detection: PropTypes.shape(detectionPropTypes),
    name: PropTypes.string,
    onChange: PropTypes.func,
    onSubmit: PropTypes.func
};

export default Label;