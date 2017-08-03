import React from 'react';
import PropTypes from 'prop-types';

import Canvas from './Canvas';

import './Snapshot.css';

CanvasRenderingContext2D.prototype.strokeRoundRect = function(x, y, width, height, radius = 4) {
    if (width < 2 * radius) 
        radius = width / 2;
    if (height < 2 * radius) 
        radius = height / 2;
    this.beginPath();
    this.moveTo(x + radius, y);
    this.arcTo(x + width, y, x + width, y + height, radius);
    this.arcTo(x + width, y + height, x, y + height, radius);
    this.arcTo(x, y + height, x, y, radius);
    this.arcTo(x, y, x + width, y, radius);
    this.closePath();
    this.stroke();
    return this;
};

class Snapshot extends React.Component {
    constructor(props) {
        super(props);
        this.drawDetections = this
            .drawDetections
            .bind(this);
    }

    drawDetections(detections) {
        const canvas = this.refs.detections;
        const context = canvas.getContext(`2d`);
        context.strokeStyle = `rgba(255, 255, 255, 0.67)`;
        context.fillStyle = `rgba(255, 255, 255, 0.67)`;
        context.clearRect(0, 0, canvas.width, canvas.height);
        for (let detection of detections) {
            context.strokeRoundRect(detection.x, detection.y, detection.width, detection.height);
        }
    }

    componentDidMount() {
        this.drawDetections(this.props.detections);
    }

    componentWillReceiveProps({detections}) {
        this.drawDetections(detections);
    }

    // shouldComponentUpdate({date}) { return date > this.props.date; }

    render() {
        const date = new Date(this.props.date);
        return <div ref="container" className="Snapshot">
            <Canvas
                ref="image"
                className="Snapshot-image"
                base64={this.props.image}
                type="jpeg"
                width={this.props.width}
                height={this.props.height}/>
            <canvas
                ref="detections"
                className="Snapshot-detections"
                width={this.props.width}
                height={this.props.height}/>
            <time ref="date" className="Snapshot-date" dateTime={date}>
                {date.toLocaleString()}
            </time>
        </div>;
    }
}

const detectionPropTypes = {
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired
};
Snapshot.propTypes = {
    date: PropTypes.number.isRequired,
    detections: PropTypes
        .arrayOf(PropTypes.shape(detectionPropTypes).isRequired)
        .isRequired,
    image: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number
};

Snapshot.defaultProps = {
    width: 640,
    height: 480
};

export default Snapshot;