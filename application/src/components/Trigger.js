import React from 'react';
import PropTypes from 'prop-types';
import {Button} from 'react-bootstrap';

class Trigger extends React.Component {

    shouldComponentUpdate({text, action}) {
        return text !== this.props.text;
    }

    render() {
        const onClick = () => this
            .props
            .onClick({type: this.props.action});
        return <Button className="Trigger" onClick={onClick}>
            {this.props.children}
        </Button>;
    }
}

Trigger.propTypes = {
    action: PropTypes.string,
    onClick: PropTypes.func
};

export default Trigger;