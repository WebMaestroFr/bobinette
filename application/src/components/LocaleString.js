import React from 'react';
import PropTypes from 'prop-types';

class LocaleString extends React.Component {

    shouldComponentUpdate({timestamp}) {
        return timestamp !== this.props.timestamp;
    }

    render() {
        const {
            timestamp,
            ...attrs
        } = this.props;
        const date = new Date(timestamp);
        const localeString = date.toLocaleString();
        return <time dateTime={date} {...attrs}>
            {localeString}
        </time>;
    }
}

LocaleString.propTypes = {
    timestamp: PropTypes.number
};

LocaleString.defaultProps = {
    timestamp: 0
};

export default LocaleString;