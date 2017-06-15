import React from 'react';
import PropTypes from 'prop-types';

import './Camera.css';

class Camera extends React.Component {

    componentDidMount() {
        const context = this
            .refs
            .mjpeg
            .getContext(`2d`);
        const image = new Image();
        image.onload = () => {
            context.drawImage(image, 0, 0, this.props.width, this.props.height);
        };
        this.loadImage = (e) => {
            image.src = `data:image/jpeg;base64,${e.data}`;
        };
        this.socket = new WebSocket(`ws://${document.location.hostname}:${this.props.port}`);
        this
            .socket
            .addEventListener(`message`, this.loadImage);
    }

    componentWillUnmount() {
        this
            .socket
            .removeEventListener(`message`, this.loadImage);
    }

    shouldComponentUpdate() {
        return false;
    }

    render() {
        return (<canvas ref="mjpeg" className="Camera-mjpeg" width={this.props.width} height={this.props.height}/>);
    }
}

Camera.propTypes = {
    port: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number
};

Camera.defaultProps = {
    port: 9000,
    width: 640,
    height: 480
};

export default Camera;