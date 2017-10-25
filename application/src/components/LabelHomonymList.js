import React from 'react';
import PropTypes from 'prop-types';

import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';

import {Alert} from 'react-bootstrap';

import Canvas from './Canvas';

class LabelHomonymList extends React.Component {

    /* shouldComponentUpdate({homonyms, validationState}) {
        return homonyms.length !== this.props.homonyms.length || validationState !== this.props.validationState;
    } */

    render() {
        if (this.props.homonyms.length === 0) {
            return null;
        }
        const renderLabelHomonym = (label) => <CSSTransition key={label.id} timeout={400} classNames="fade">
            <Canvas base64={label.detection.thumbnail} height={64} key={label.id} type="png" width={64}/>
        </CSSTransition>;
        return <TransitionGroup
            bsStyle={this.props.validationState}
            className="LabelHomonymList"
            component={Alert}>
            {this
                .props
                .homonyms
                .map(renderLabelHomonym)}
        </TransitionGroup>;
    }
}

LabelHomonymList.propTypes = {
    homonyms: PropTypes.array,
    validationState: PropTypes.string
};

export default LabelHomonymList;