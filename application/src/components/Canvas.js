import React from 'react';
import PropTypes from 'prop-types';

import './Canvas.css';

class Canvas extends React.Component {

    constructor(props) {
        super(props);
        this.clearImage = this
            .clearImage
            .bind(this);
        this.drawImage = this
            .drawImage
            .bind(this);
        this.loadImage = this
            .loadImage
            .bind(this);
        this.image = new Image();
        this.image.onload = this
            .drawImage
            .bind(this);
    }

    clearImage() {
        const canvas = this.refs.canvas;
        if (canvas) {
            canvas
                .getContext(`2d`)
                .clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    drawImage() {
        const canvas = this.refs.canvas;
        if (canvas) {
            if (this.image.src) {
                canvas
                    .getContext(`2d`)
                    .drawImage(this.image, 0, 0, canvas.width, canvas.height);
            } else {
                this.clearImage();
            }
        }
    }

    loadImage(base64, type) {
        if (base64) {
            this.image.src = `data:image/${type};base64,${base64}`;
        } else {
            this.image.src = null;
            this.clearImage();
        }
    }

    componentDidMount() {
        this.loadImage(this.props.base64, this.props.type);
    }

    componentWillReceiveProps({base64, type}) {
        if (base64 !== this.props.base64 || type !== this.props.type) {
            this.loadImage(base64, type);
        }
    }

    shouldComponentUpdate({height, width}) {
        return height !== this.props.height || width !== this.props.width;
    }

    componentDidUpdate() {
        this.drawImage();
    }

    render() {
        const {height, width} = this.props;
        return <canvas className="Canvas" height={height} ref="canvas" width={width}/>;
    }
}

Canvas.propTypes = {
    base64: PropTypes.string,
    height: PropTypes.number,
    type: PropTypes.string,
    width: PropTypes.number
};

Canvas.defaultProps = {
    base64: null,
    height: 480,
    type: `jpeg`,
    width: 640
};

export default Canvas;