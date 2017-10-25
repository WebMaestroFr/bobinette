import React from 'react';
import PropTypes from 'prop-types';

import './Canvas.css';

class Canvas extends React.Component {

    constructor(props) {
        super(props);
        this.loadBase64 = this
            .loadBase64
            .bind(this);
        this.animationFrame = null;
        this.image = new Image();
        this.image.onload = this
            .onImageLoad
            .bind(this);
    }

    loadBase64() {
        const {base64, type} = this.props;
        if (type && base64) {
            const src = `data:image/${type};base64,${base64}`;
            if (src !== this.image.src) {
                return this.image.src = src;
            }
        } else {
            this
                .refs
                .canvas
                .getContext(`2d`)
                .clearRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);
        }
        this.animationFrame = window.requestAnimationFrame(this.loadBase64);
    }

    onImageLoad() {
        if (this.refs.canvas) {
            this
                .refs
                .canvas
                .getContext(`2d`)
                .drawImage(this.image, 0, 0, this.refs.canvas.width, this.refs.canvas.height);
            this.animationFrame = window.requestAnimationFrame(this.loadBase64);
        }
    }

    componentDidMount() {
        this.animationFrame = window.requestAnimationFrame(this.loadBase64);
    }

    shouldComponentUpdate({height, width}) {
        return height !== this.props.height || width !== this.props.width;
    }

    componentWillUpdate() {
        if (this.animationFrame) {
            window.cancelAnimationFrame(this.animationFrame);
        }
    }

    componentDidUpdate() {
        this.animationFrame = window.requestAnimationFrame(this.loadBase64);
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