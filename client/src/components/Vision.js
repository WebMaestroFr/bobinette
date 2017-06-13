import React from 'react';
import PropTypes from 'prop-types';

import './Vision.css';

class Vision extends React.Component {

    componentDidMount() {
        const context = this
            .refs
            .detection
            .getContext('2d');

        this.drawDetections = (event) => {
            context.clearRect(0, 0, this.props.width, this.props.height);
            context.strokeStyle = 'rgba(255,255,255,0.33)';
            for (const detection of event.data) {
                if (detection.transform) {
                    context.save();
                    context.translate(detection.transform.center.x, detection.transform.center.y);
                    context.rotate(detection.transform.angle);
                    context.strokeRect(detection.region.x, detection.region.y, detection.region.width, detection.region.height);
                    context.restore();
                } else {
                    context.strokeRect(detection.region.x, detection.region.y, detection.region.width, detection.region.height);
                }
            }
        };

        if (this.props.event) {
            document.addEventListener(this.props.event, this.drawDetections);
        }
        if (this.props.detections) {
            this.drawDetections({data: this.props.detections});
        }
    }

    componentWillUnmount() {
        if (this.props.event) {
            document.removeEventListener(this.props.event, this.drawDetections);
        }
    }

    shouldComponentUpdate() {
        return false;
    }

    render() {
        return (
            <div className="Vision">
                {this.props.children}
                <canvas
                    ref="detection"
                    className="Vision-detection"
                    width={this.props.width}
                    height={this.props.height}/>
            </div>
        );
    }
}

Vision.propTypes = {
    children: PropTypes.element,
    event: PropTypes.string,
    detections: PropTypes.array,
    height: PropTypes.number,
    width: PropTypes.number
};

Vision.defaultProps = {
    width: 640,
    height: 480
};

export default Vision;