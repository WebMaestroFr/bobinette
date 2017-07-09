import React from 'react';
import PropTypes from 'prop-types';
import {Image, Media} from 'react-bootstrap';

import './Detection.css';

const ISO8601Regex = /^.*(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z$/;
const pathDateFormat = `$1/$2/$3/$4-$5-$6_$7`;

const staticPort = 9000;

class DetectionLabelImage extends React.Component {

    componentDidMount() {
        this.image = new Image();
        this.image.onload = () => {
            console.log("loaded");
            this
                .refs
                .canvas
                .getContext(`2d`)
                .drawImage(this.image, this.props.detection.x, this.props.detection.y, this.props.detection.width, this.props.detection.height, 0, 0, this.props.width, this.props.height);
        };
        this.image.onerror = () => {
            console.log("error");
        }
        this.updateImage = (detection) => {
            this.image.src = `http://${window
                .location
                .hostname}:${staticPort}/${detection
                .date
                .toISOString()
                .replace(ISO8601Regex, pathDateFormat)}.jpg`;
            // console.log(this.image);
        }
        this.updateImage(this.props.detection);
    }

    componentWillReceiveProps(props) {
        if (this.props.detection.date !== props.detection.date) {
            this.updateImage(props.detection);
        }
    }

    shouldComponentUpdate(props) {
        return this.props.width !== props.width || this.props.height !== props.height;
    }

    render() {
        return <canvas
            ref="canvas"
            className="DetectionLabelImage"
            width={this.props.width}
            height={this.props.height}/>;
    }
}

DetectionLabelImage.propTypes = {
    detection: PropTypes.object,
    width: PropTypes.number,
    height: PropTypes.number
};

DetectionLabelImage.defaultProps = {
    detection: null,
    width: 64,
    height: 64
};

class DetectionLabel extends React.Component {

    shouldComponentUpdate(props) {
        return this.props.detections.length !== props.detections.length;
    }

    render() {
        const detection = this
            .props
            .detections
            .reduce((a, b) => {
                return a.date > b.date
                    ? a
                    : b;
            });
        detection.date = new Date(detection.date);
        return <Media className="DetectionLabel">
            <Media.Left>
                <DetectionLabelImage detection={detection} width={64} height={64}/>
            </Media.Left>
            <Media.Body>
                <Media.Heading>
                    {this.props.name || `Label #${this.props.id}`}
                </Media.Heading>
                <time ref="time" dateTime={detection.date}>{detection
                        .date
                        .toLocaleString()}</time>
            </Media.Body>
        </Media>;
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