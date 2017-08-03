import React from 'react';
import PropTypes from 'prop-types';
import {CSSTransitionGroup} from 'react-transition-group'

import './LabelList.css';

import Label from './Label';

class LabelList extends React.Component {

    render() {
        const renderItem = (item) => {
            return <Label
                key={item.id}
                className="LabelList-item"
                {...item}
                onNameChange={this.props.onNameChange}
                onNameBlur={this.props.onNameBlur}
                onNameFocus={this.props.onNameFocus}/>;
        }
        return <CSSTransitionGroup
            transitionName="LabelList"
            transitionEnterTimeout={400}
            transitionLeaveTimeout={400}>
            {this
                .props
                .items
                .map(renderItem)}
        </CSSTransitionGroup>;
    }
}

const itemPropTypes = {
    id: PropTypes.number.isRequired,
    date: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired
};
LabelList.propTypes = {
    items: PropTypes
        .arrayOf(PropTypes.shape(itemPropTypes).isRequired)
        .isRequired,
    onNameChange: PropTypes.func.isRequired,
    onNameBlur: PropTypes.func,
    onNameFocus: PropTypes.func
};

export default LabelList;