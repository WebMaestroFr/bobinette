import React from 'react';
import PropTypes from 'prop-types';

import './Snapshot.css';

class Snapshot extends React.Component {

    render() {
        const ratio = {
            x: this.props.width / this.props.region.width,
            y: this.props.height / this.props.region.height
        };
        const size = {
            width: this.props.width,
            height: this.props.height
        };
        const style = {
            left: -this.props.region.x,
            top: -this.props.region.y,
            transform: "scale(" + ratio.x + "," + ratio.y + ")",
            transformOrigin: this.props.region.x + "px " + this.props.region.y + "px"
        };
        return (
            <div className="Snapshot" style={size}>
                <img className="Snapshot-image" alt={this.props.date} src={this.props.image} style={style}/>
            </div>
        );
    }
}

Snapshot.propTypes = {
    date: React
        .PropTypes
        .instanceOf(Date),
    image: PropTypes.string,
    region: PropTypes.object,
    height: PropTypes.number,
    width: PropTypes.number
};

export default Snapshot;