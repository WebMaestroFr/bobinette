import React from 'react';
import PropTypes from 'prop-types';

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

    componentDidMount() {
        const imageContext = this
            .refs
            .image
            .getContext(`2d`);
        this.image = new Image(this.props.width, this.props.height);
        this.image.onload = () => {
            imageContext.drawImage(this.image, 0, 0, this.props.width, this.props.height);
        };
        this.detectionsContext = this
            .refs
            .detections
            .getContext(`2d`);
        this.detectionsContext.strokeStyle = `rgba(255,255,255,0.5)`;
    }

    componentWillReceiveProps(props) {
        this.image.src = `data:image/jpeg;base64,${props.instance.image}`;
        this
            .detectionsContext
            .clearRect(0, 0, this.props.width, this.props.height);
        for (let detection of props.instance.detections) {
            this
                .detectionsContext
                .strokeRoundRect(detection.x, detection.y, detection.width, detection.height);
        }
    }

    shouldComponentUpdate() {
        return false;
    }

    render() {
        return (
            <div className="Snapshot">
                <canvas ref="image" className="Snapshot-image" width={this.props.width} height={this.props.height}/>
                <canvas
                    ref="detections"
                    className="Snapshot-detections"
                    width={this.props.width}
                    height={this.props.height}/>
            </div>
        );
    }
}

Snapshot.propTypes = {
    instance: PropTypes.object,
    width: PropTypes.number,
    height: PropTypes.number
};

Snapshot.defaultProps = {
    instance: null,
    width: 640,
    height: 480
};

export default Snapshot;