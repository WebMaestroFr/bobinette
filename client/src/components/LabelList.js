import React from 'react';
import PropTypes from 'prop-types';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';

import './LabelList.css';

import Label from './Label';

class LabelList extends React.Component {

    render() {
        const renderItem = (item) => {
            return <CSSTransition key={item.id} timeout={2400} classNames="LabelList-item">
                <Label
                    className="LabelList-item"
                    {...item}
                    onNameChange={this.props.onNameChange}
                    onNameBlur={this.props.onNameBlur}
                    onNameFocus={this.props.onNameFocus}/>
            </CSSTransition>;
        }
        return <TransitionGroup className="LabelList">
            {this
                .props
                .items
                .map(renderItem)}
        </TransitionGroup>;
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