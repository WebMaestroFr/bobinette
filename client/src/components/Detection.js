import React from 'react';
import PropTypes from 'prop-types';

import './Detection.css';

CanvasRenderingContext2D.prototype.drawRegion = function({
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
            .regions
            .getContext(`2d`);
        this.drawRegions = (regions) => {
            context.clearRect(0, 0, this.props.width, this.props.height);
            context.strokeStyle = 'rgba(255,255,255,0.5)';
            for (let region of regions) {
                context.drawRegion(region, 4);
            }
        };
        this.drawRegions(this.props.regions);
    }

    componentWillReceiveProps(props) {
        this.drawRegions(props.regions);
    }

    shouldComponentUpdate() {
        return false;
    }

    render() {
        return (
            <div className="Detection">
                {this.props.children}
                <canvas
                    ref="regions"
                    className="Detection-regions"
                    width={this.props.width}
                    height={this.props.height}/>
            </div>
        );
    }
}

Detection.propTypes = {
    children: PropTypes.element,
    regions: PropTypes.array,
    height: PropTypes.number,
    width: PropTypes.number
};

Detection.defaultProps = {
    regions: [],
    width: 640,
    height: 480
};

export default Detection;