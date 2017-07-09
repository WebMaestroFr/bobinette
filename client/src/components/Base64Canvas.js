import React from 'react';
import PropTypes from 'prop-types';

import './Base64Canvas.css';

class Base64Canvas extends React.Component {
    constructor(props) {
        super(props);
        this.image = new Image();
        this.image.onload = () => {
            this
                .refs
                .canvas
                .getContext(`2d`)
                .drawImage(this.image, 0, 0);
        };
        this.drawImage = this
            .drawImage
            .bind(this);
    }

    drawImage(type, base64) {
        this.image.src = `data:image/${this.props.type};base64,${this.props.base64}`;
    }

    componentDidMount() {
        if (this.props.base64) {
            this.drawImage(this.props.type, this.props.base64);
        }
    }

    componentWillReceiveProps(props) {
        if (props.base64 && this.props.base64 !== props.base64) {
            this.drawImage(props.type, props.base64);
        }
    }

    shouldComponentUpdate(props) {
        return this.props.width !== props.width || this.props.height !== props.height;
    }

    render() {
        return <canvas ref="canvas" className="Base64Canvas" width={this.props.width} height={this.props.height}/>;
    }
}

Base64Canvas.propTypes = {
    base64: PropTypes.string,
    type: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number
};

Base64Canvas.defaultProps = {
    base64: null,
    type: `jpeg`,
    width: 640,
    height: 480
};

export default Base64Canvas;