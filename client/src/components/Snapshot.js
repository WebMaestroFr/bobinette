import React from 'react';
import PropTypes from 'prop-types';

import './Snapshot.css';

class SnapshotImage extends React.Component {

    render() {
        return (<canvas ref="canvas" className="SnapshotImage" width={this.props.width} height={this.props.height}/>);
    }

    componentDidMount() {
        this.image = new Image();
        this.image.onload = () => {
            this
                .refs
                .canvas
                .getContext(`2d`)
                .drawImage(this.image, 0, 0);
        };
        if (this.props.base64) {
            this.image.src = `data:image/${this.props.type};base64,${this.props.base64}`;
        }
    }

    componentWillReceiveProps(props) {
        if (this.props.base64 !== props.base64) {
            this.image.src = `data:image/${props.type};base64,${props.base64}`;
        }
    }

    shouldComponentUpdate(props) {
        return this.props.width !== props.width || this.props.height !== props.height;
    }
}

SnapshotImage.propTypes = {
    base64: PropTypes.string,
    type: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number
};

SnapshotImage.defaultProps = {
    base64: null,
    type: "jpeg",
    width: 640,
    height: 480
};

CanvasRenderingContext2D.prototype.strokeRoundRect = function(x, y, width, height, radius = 3) {
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
        this.state = {
            date: new Date(props.date)
        };
    }

    render() {
        return (
            <div ref="container" className="Snapshot">
                <SnapshotImage
                    ref="image"
                    className="Snapshot-image"
                    base64={this.props.image}
                    type="jpeg"
                    width={this.props.width}
                    height={this.props.height}/>
                <canvas
                    ref="canvas"
                    className="Snapshot-detections"
                    width={this.props.width}
                    height={this.props.height}/>
                <time ref="time" className="Snapshot-date" dateTime={this.props.date}>{new Date(this.props.date).toLocaleString()}</time>
            </div>
        );
    }

    componentDidMount() {
        this.updateDetections = () => {
            const context = this
                .refs
                .canvas
                .getContext(`2d`);
            context.strokeStyle = `rgba(255, 255, 255, 0.67)`;
            context.clearRect(0, 0, this.props.width, this.props.height);
            for (const detection of this.props.detections) {
                context.strokeRoundRect(detection.x, detection.y, detection.width, detection.height);
            }
        };
        this.updateDetections();
    }

    componentDidUpdate() {
        this.updateDetections();
    }
}

Snapshot.propTypes = {
    date: PropTypes.string,
    detections: PropTypes.array,
    image: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number
};

Snapshot.defaultProps = {
    date: null,
    detections: [],
    image: null,
    width: 640,
    height: 480
};

export default Snapshot;