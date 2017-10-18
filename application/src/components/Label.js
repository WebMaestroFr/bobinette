import React from 'react';
import PropTypes from 'prop-types';
import {Form, FormGroup, FormControl, InputGroup, Media} from 'react-bootstrap';

import Canvas from './Canvas'

import './Label.css';

class Label extends React.Component {

    shouldComponentUpdate({name, detection}) {
        return name !== this.props.name || detection.snapshot_date > this.props.detection.snapshot_date;
    }

    render() {
        const date = new Date(this.props.detection.snapshot_date);
        const onNameChange = ({target}) => this
            .props
            .onNameChange(this.props.id, target.value);
        const onNameFocus = this.props.onNameFocus
            ? () => this
                .props
                .onNameFocus(this.props.id)
            : null;
        return <Media className="Label">
            <Media.Left>
                <Canvas
                    ref="detection-thumbnail"
                    className="Label-detection-thumbnail"
                    base64={this.props.detection.thumbnail}
                    type="png"
                    width={64}
                    height={64}/>
            </Media.Left>
            <Media.Body>
                <Form>
                    <FormGroup controlId="labelName" bsSize="large">
                        <time ref="date" className="Label-date" dateTime={date}>
                            {date.toLocaleString()}
                        </time>
                        <InputGroup>
                            <InputGroup.Addon>
                                <input type="checkbox" aria-label="Access"/>
                            </InputGroup.Addon><FormControl
                                ref="name"
                                className="Label-name"
                                type="text"
                                value={this.props.name}
                                placeholder={`Label #${this.props.id}`}
                                onChange={onNameChange}
                                onFocus={onNameFocus}
                                onBlur={this.props.onNameBlur}/>
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
    id: PropTypes.number,
    detection: PropTypes.shape(detectionPropTypes),
    name: PropTypes.string,
    onNameChange: PropTypes.func,
    onNameBlur: PropTypes.func,
    onNameFocus: PropTypes.func
};

export default Label;