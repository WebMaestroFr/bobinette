import React from 'react';
import PropTypes from 'prop-types';
import {
    Alert,
    Button,
    Form,
    FormGroup,
    FormControl,
    Glyphicon,
    InputGroup,
    Media
} from 'react-bootstrap';

import Canvas from './Canvas'
import LocaleString from './LocaleString';

import './Label.css';

export class Label extends React.Component {

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
        this.onTrain = this
            .onTrain
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

    onTrain(event) {
        event.preventDefault();
        return this.props.onTrain
            ? this
                .props
                .onTrain(this.props.id)
            : null;
    }

    componentWillReceiveProps({access, name}) {
        this.setState({access, name});
    }

    shouldComponentUpdate({
        detection,
        homonyms,
        id
    }, {access, name}) {
        return access !== this.state.access || name !== this.state.name || detection.snapshot_date !== this.props.detection.snapshot_date || homonyms.length !== this.props.homonyms.length || id !== this.props.id;
    }

    render() {
        const renderHomonym = (label) => <Canvas
            base64={label.detection.thumbnail}
            height={48}
            ref="detection-thumbnail"
            type="png"
            width={48}/>;
        const homonyms = this.props.homonyms.length
            ? <Alert bsStyle="warning" className="Label-homonyms">
                    {this
                        .props
                        .homonyms
                        .map(renderHomonym)}
                </Alert>
            : null;
        const trainButton = this.props.homonyms.length
            ? <InputGroup.Button>
                    <Button bsSize="large" bsStyle="warning" onClick={this.onTrain}>
                        <Glyphicon glyph="refresh"/>&nbsp;Train
                    </Button>
                </InputGroup.Button>
            : null;
        const thumbnailClasses = {
            "Label-detection-thumbnail": true,
            "Label-train-active": this.props.homonyms.length
        };
        return <Media className="Label">
            <Media.Left className={thumbnailClasses}>
                <Canvas
                    base64={this.props.detection.thumbnail}
                    height={128}
                    ref="detection-thumbnail"
                    type="png"
                    width={128}/>
            </Media.Left>
            <Media.Body>
                <Form onSubmit={this.onSubmit}>
                    <FormGroup
                        bsSize="large"
                        controlId="labelName"
                        validationState={this.props.homonyms.length
                        ? "warning"
                        : this.state.name
                            ? this.state.access
                                ? "success"
                                : null
                            : "error"}>
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
                                value={this.state.name}/> {trainButton}
                        </InputGroup>
                    </FormGroup>
                </Form>
                {homonyms}
            </Media.Body>
        </Media>;
    }
}

const detectionPropTypes = {
    snapshot_date: PropTypes.number,
    thumbnail: PropTypes.string
};

export const labelPropTypes = {
    access: PropTypes.bool,
    detection: PropTypes.shape(detectionPropTypes),
    id: PropTypes.number,
    name: PropTypes.string
};

Label.propTypes = {
    ...labelPropTypes,
    homonyms: PropTypes.arrayOf(PropTypes.shape(labelPropTypes)),
    onChange: PropTypes.func,
    onSubmit: PropTypes.func,
    onTrain: PropTypes.func
};

export default Label;