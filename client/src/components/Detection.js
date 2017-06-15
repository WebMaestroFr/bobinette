import React from 'react';
import PropTypes from 'prop-types';

import './Detection.css';

CanvasRenderingContext2D.prototype.strokeRoundRect = function({
    x,
    y,
    width,
    height
}, radius) {
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

class Detection extends React.Component {

    componentDidMount() {
        const context = this
            .refs
            .detections
            .getContext(`2d`);
        this.drawRegions = (detections) => {
            context.clearRect(0, 0, this.props.width, this.props.height);
            for (let detection of detections) {
                let opacity = detection.objects.length < 4
                    ? detection.objects.length / 4
                    : 1;
                context.strokeStyle = `rgba(255,255,255,${opacity})`;
                context.strokeRoundRect(detection, 4);
            }
        };
        this.drawRegions(this.props.detections);
    }

    componentWillReceiveProps(props) {
        this.drawRegions(props.detections);
    }

    shouldComponentUpdate() {
        return false;
    }

    render() {
        return (
            <div className="Detection">
                {this.props.children}
                <canvas
                    ref="detections"
                    className="Detection-detections"
                    width={this.props.width}
                    height={this.props.height}/>
            </div>
        );
    }
}

Detection.propTypes = {
    children: PropTypes.element,
    detections: PropTypes.array,
    height: PropTypes.number,
    width: PropTypes.number
};

Detection.defaultProps = {
    detections: [],
    width: 640,
    height: 480
};

export default Detection;