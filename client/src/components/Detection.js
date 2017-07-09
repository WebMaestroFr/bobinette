import React from 'react';
import PropTypes from 'prop-types';
import {Form, FormGroup, FormControl, Media} from 'react-bootstrap';

import Base64Canvas from './Base64Canvas'

import './Detection.css';

class Label extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            date: 0,
            image: null
        };
        this.updateDetections = this
            .updateDetections
            .bind(this);
    }

    updateDetections(detections) {
        const detection = detections.reduce((a, b) => {
            return a.date > b.date
                ? a
                : b;
        });
        if (detection.date > this.state.date) {
            this.setState({date: detection.date, image: detection.image});
        }
    }

    componentDidMount() {
        this.updateDetections(this.props.detections);
    }

    componentWillReceiveProps(props) {
        this.updateDetections(props.detections);
    }

    render() {
        const date = new Date(this.state.date);
        return <Media className="Label">
            <Media.Left>
                <Base64Canvas
                    ref="image"
                    className="Label-image"
                    base64={this.state.image}
                    type="jpeg"
                    width={64}
                    height={64}/>
            </Media.Left>
            <Media.Body>
                <Form className="Label-name">
                    <FormGroup controlId="labelName">
                        <FormControl
                            ref="name"
                            type="text"
                            value={this.props.name}
                            placeholder={`Label #${this.props.id}`}
                            onChange={this.props.onChange}/>
                    </FormGroup>
                </Form>
                <time ref="date" className="Label-date" dateTime={date}>
                    {date.toLocaleString()}
                </time>
            </Media.Body>
        </Media>;
    }
}

Label.propTypes = {
    id: PropTypes.number,
    name: PropTypes.string,
    detections: PropTypes.array
};

Label.defaultProps = {
    id: null,
    name: null,
    detections: []
};

class Detection extends React.Component {

    render() {
        const listLabels = this
            .props
            .labels
            .map((label) => {
                return <Label className="Detection-label" key={label.id} {...label}/>;
            });
        return <div className="Detection">{listLabels}</div>;
    }
}

Detection.propTypes = {
    labels: PropTypes.array
};

Detection.defaultProps = {
    labels: []
};

export default Detection;