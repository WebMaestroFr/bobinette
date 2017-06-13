import React from 'react';
import PropTypes from 'prop-types';

import './Detection.css';

class Detection extends React.Component {

    componentDidMount() {
        const context = this
            .refs
            .regions
            .getContext(`2d`);
        this.drawDetections = (regions) => {
            context.clearRect(0, 0, this.props.width, this.props.height);
            context.strokeStyle = 'rgba(255,255,255,0.5)';
            for (const region of regions) {
                context.strokeRect(region.x, region.y, region.width, region.height);
            }
        };
        this.drawDetections(this.props.regions);
    }

    componentWillReceiveProps(props) {
        this.drawDetections(props.regions);
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