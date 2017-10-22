import React from 'react';
import PropTypes from 'prop-types';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';

import './LabelList.css';

import {Label, labelPropTypes} from './Label';

class LabelList extends React.Component {

    render() {
        const renderLabel = (label) => {
            const byName = (l) => l.name && l.name === label.name && l.id !== label.id;
            return <CSSTransition key={label.id} timeout={600} classNames="LabelList-label">
                <Label
                    className="LabelList-label"
                    {...label}
                    onChange={this.props.onChange}
                    onSubmit={this.props.onSubmit}
                    onTrain={this.props.onTrain}
                    homonyms={this
                    .props
                    .labels
                    .filter(byName)}/>
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
    labels: PropTypes.arrayOf(PropTypes.shape(labelPropTypes)),
    onChange: PropTypes.func,
    onSubmit: PropTypes.func,
    onTrain: PropTypes.func
};

export default LabelList;