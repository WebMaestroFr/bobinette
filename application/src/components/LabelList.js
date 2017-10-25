import React from 'react';
import PropTypes from 'prop-types';

import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';

import Label from './Label';

class LabelList extends React.Component {

    render() {
        const renderLabel = (label) => {
            return <CSSTransition key={label.id} timeout={400} classNames="fade">
                <Label {...label} onChange={this.props.onChange} onTrain={this.props.onTrain}/>
            </CSSTransition>;
        };
        return <TransitionGroup className="LabelList">
            {this
                .props
                .labels
                .map(renderLabel)}
        </TransitionGroup>;
    }
}

LabelList.propTypes = {
    labels: PropTypes.arrayOf(PropTypes.shape(Label.propTypes)),
    onChange: PropTypes.func,
    onTrain: PropTypes.func
};

export default LabelList;