import React from 'react';
import PropTypes from 'prop-types';

import Canvas from './Canvas';
import LocaleString from './LocaleString';

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
        const regions = detections.map(d => d.region);
        for (let region of regions) {
            context.strokeRoundRect(region.x, region.y, region.width, region.height);
        }
    }

    componentDidMount() {
        this.drawDetections(this.props.detections);
    }

    componentWillReceiveProps({detections}) {
        this.drawDetections(detections);
    }

    render() {
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
            <LocaleString className="Snapshot-date" ref="date" timestamp={this.props.date}/>
        </div>;
    }
}

const regionPropTypes = {
    x: PropTypes.number,
    y: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number
};

const detectionPropTypes = {
    region: PropTypes.shape(regionPropTypes)
};

Snapshot.propTypes = {
    date: PropTypes.number,
    detections: PropTypes.arrayOf(PropTypes.shape(detectionPropTypes)),
    image: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number
};

Snapshot.defaultProps = {
    width: 640,
    height: 480
};

export default Snapshot;