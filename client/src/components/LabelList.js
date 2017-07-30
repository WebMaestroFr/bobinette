import React from 'react';
import PropTypes from 'prop-types';

import './LabelList.css';

import Label from './Label';

class LabelList extends React.Component {

    render() {
        const renderItem = (item) => {
            return <Label key={item.id} className="LabelList-item" {...item} onNameChange={this.props.onNameChange}/>;
        }
        return <div className="LabelList">{this
                .props
                .items
                .map(renderItem)}</div>;
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
    onNameChange: PropTypes.func.isRequired
};

export default LabelList;