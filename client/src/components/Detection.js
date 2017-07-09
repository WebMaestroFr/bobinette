import React from 'react';
import PropTypes from 'prop-types';

import './Detection.css';

class DetectionLabel extends React.Component {

    shouldComponentUpdate(props) {
        return this.props.detections.length !== props.detections.length;
    }

    render() {
        const date = new Date(Math.max(...this.props.detections.map(d => d.date)));
        return <li className="DetectionLabel">
            <h3>{this.props.name || `Label #${this.props.id}`}</h3>
            <time ref="time" dateTime={date}>{date.toLocaleString()}</time>
            <h5>{this.props.detections.length}&nbsp;Detections</h5>
        </li>;
    }
}

DetectionLabel.propTypes = {
    id: PropTypes.number,
    name: PropTypes.string,
    detections: PropTypes.array
};

DetectionLabel.defaultProps = {
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
                return <DetectionLabel className="Detection-label" key={label.id} {...label}/>;
            });
        return <ul className="Detection">{listLabels}</ul>;
    }
}

Detection.propTypes = {
    labels: PropTypes.array
};

Detection.defaultProps = {
    labels: []
};

export default Detection;