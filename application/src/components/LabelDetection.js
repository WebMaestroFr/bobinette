import React from 'react';
import PropTypes from 'prop-types';

import {Media} from 'react-bootstrap';

import Canvas from './Canvas';
import LocaleString from './LocaleString';

class LabelDetection extends React.Component {

    /* shouldComponentUpdate({snapshot_date, thumbnail}) {
        return snapshot_date !== this.props.snapshot_date || thumbnail !== this.props.thumbnail;
    } */

    render() {
        const {children, snapshot_date, thumbnail} = this.props;
        return <Media className="LabelDetection">
            <Media.Left className="LabelDetection-thumbnail">
                <Canvas base64={thumbnail} height={128} type="png" width={128}/>
            </Media.Left>
            <Media.Body>
                <LocaleString timestamp={snapshot_date}/> {children}
            </Media.Body>
        </Media>;
    }
}

LabelDetection.propTypes = {
    snapshot_date: PropTypes.number,
    thumbnail: PropTypes.string
};

export default LabelDetection;