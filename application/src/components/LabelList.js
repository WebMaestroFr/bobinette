import React from 'react';
import PropTypes from 'prop-types';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';

import './LabelList.css';

import Label from './Label';

class LabelList extends React.Component {

    render() {
        const renderLabel = (label) => {
            return <CSSTransition key={label.id} timeout={2400} classNames="LabelList-label">
                <Label
                    className="LabelList-label"
                    {...label}
                    onChange={this.props.onChange}
                    onSubmit={this.props.onSubmit}/>
            </CSSTransition>;
        }
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
    onSubmit: PropTypes.func
};

export default LabelList;