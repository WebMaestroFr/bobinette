import React from 'react';
import PropTypes from 'prop-types';

import './Canvas.css';

class Canvas extends React.Component {
    constructor(props) {
        super(props);
        this.image = new Image();
        this.image.onload = this
            .handleImageLoad
            .bind(this);
        this.drawImage = this
            .drawImage
            .bind(this);
    }

    handleImageLoad() {
        this
            .refs
            .canvas
            .getContext(`2d`)
            .drawImage(this.image, 0, 0, this.props.width, this.props.height);
    }

    drawImage(base64, type) {
        if (base64) {
            this.image.src = `data:image/${type};base64,${base64}`;
        } else {
            const canvas = this.refs.canvas;
            canvas
                .getContext(`2d`)
                .clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    componentDidMount() {
        this.drawImage(this.props.base64, this.props.type);
    }

    componentWillReceiveProps({base64, type}) {
        if (this.props.base64 !== base64) {
            this.drawImage(base64, type);
        }
    }

    shouldComponentUpdate({width, height}) {
        return width !== this.props.width || height !== this.props.height;
    }

    render() {
        return <canvas ref="canvas" className="Canvas" width={this.props.width} height={this.props.height}/>;
    }
}

Canvas.propTypes = {
    base64: PropTypes.string,
    type: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number
};

Canvas.defaultProps = {
    base64: null,
    type: `jpeg`,
    width: 640,
    height: 480
};

export default Canvas;