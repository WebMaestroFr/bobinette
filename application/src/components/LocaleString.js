import React from 'react';
import PropTypes from 'prop-types';

class LocaleString extends React.Component {

    shouldComponentUpdate({timestamp}) {
        return timestamp !== this.props.timestamp;
    }

    render() {
        const {timestamp} = this.props;
        const date = new Date(timestamp);
        const localeString = date.toLocaleString();
        return <time className="LocaleString" dateTime={date}>
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