import React from 'react';
import PropTypes from 'prop-types';
import {Button} from 'react-bootstrap';

class Trigger extends React.Component {

    /* shouldComponentUpdate({children, action}) {
        return children !== this.props.children || action !== this.props.action;
    } */

    render() {
        const {
            children,
            action,
            onClick,
            ...attrs
        } = this.props;
        const handleClick = () => onClick({type: action});
        return <Button className="Trigger" onClick={handleClick} {...attrs}>
            {children}
        </Button>;
    }
}

Trigger.propTypes = {
    action: PropTypes.string,
    onClick: PropTypes.func
};

export default Trigger;