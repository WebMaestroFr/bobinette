import React from 'react';
import PropTypes from 'prop-types';

class Archive extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            items: props.items || []
        };
    }

    componentDidMount() {
        this.handleItems = (event) => {
            event
                .data
                .sort((a, b) => {
                    return new Date(b.date) - new Date(a.date);
                });
            this.setState({items: event.data});
        };
        if (this.props.event) {
            document.addEventListener(this.props.event, this.handleItems);
        }
    }

    componentWillUnmount() {
        if (this.props.event) {
            document.removeEventListener(this.props.event, this.handleItems);
        }
    }

    render() {
        return (
            <ul className="Archive list-unstyled">
                {this
                    .state
                    .items
                    .map((props) => {
                        props.date = new Date(props.date);
                        return (
                            <li className="Archive-items" key={props.date}>
                                {React.createElement(this.props.component, {
                                    ...props
                                })}
                            </li>
                        );
                    })}
            </ul>
        );
    }
}

Archive.propTypes = {
    component: PropTypes.func,
    event: PropTypes.string,
    items: PropTypes.array
};

export default Archive;